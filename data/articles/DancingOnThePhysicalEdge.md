# 在物理边界上跳舞：RISC-V M-Mode 的极简主义虚拟化实验

**Dancing on the Physical Edge: A Minimalist Virtualization Experiment in RISC-V M-Mode**

> **摘要**：如果我们抛弃 Linux 的通用性，抛弃 seL4 的复杂性，能否利用 RISC-V 的 Machine Mode 直接构建一个只有几百行代码的“纳米内核”？本文探讨了一个激进的架构实验：利用 OpenSBI 和 PMP 硬件机制，将故障隔离（Fault Isolation）而非资源管理作为第一性原理，实现了一个“崩溃即瞬移”的极简系统。这既是一次对极简主义的致敬，也是一次撞击硬件物理天花板的痛快记录。

---

## 一、 引言：为什么我们总是需要那么多层？

现代计算机系统的软件栈像是一个摇摇欲坠的千层饼：硬件之上是固件，固件之上是 Hypervisor，Hypervisor 之上是 OS 内核，内核之上才是应用。每一层都在做重复的事情：地址翻译、调度、权限检查。

如果我们把这把梯子抽走，只留下最底层的那一根横木呢？

在 RISC-V 架构中，**M-Mode（Machine Mode）** 是唯一的真神。它拥有对硬件的无限访问权。但在主流系统中，它被卑微地用作 Bootloader。我的想法是：**让 M-Mode 常驻，让它直接管理 S-Mode（Supervisor Mode）的虚拟机，消灭中间商。**

这不是微内核，这是 **"Nanokernel"**。

---

## 二、 架构哲学：Erlang on Bare Metal

传统操作系统将**资源管理**视为核心，致力于让系统“不崩溃”。而这个架构采用了 Erlang/OTP 的哲学：**"Let it crash"**。

在这个设计中：

1. **OpenSBI (M-Mode)** 是唯一的稳定基石（Trusted Computing Base）。
2. **S-Mode VM** 被视为**无状态函数**，是不可信且随时可能崩溃的耗材。
3. **恢复机制** 优于 **防御机制**。

当一个 VM 崩溃时，我们不尝试修补它，不 dump core，我们直接**重启**它。

---

## 三、 暴力美学：10行代码的生死轮回

实现这一哲学的核心，是一段极简的 Trap 处理代码。它达到了 Lisp 解释器般的简洁，但承载了系统的生死轮回。

```c
// OpenSBI M-Mode Trap Handler (伪代码概念)
void mtrap_handler() {
    uint64_t cause = get_mcause();
    
    if (cause == ILLEGAL_SRET) {
        // VM 试图自我调度，我们将控制权转交给下一个 VM
        schedule_next_vm();
    } 
    else if (cause == LOAD_PAGE_FAULT || cause == STORE_PAGE_FAULT) {
        // VM 崩溃了（例如访问了非法内存）
        // 我们不杀进程，我们重启世界
        vm_restart(current_vm_id);
    }
}

```

而在 `vm_restart` 中，我们看到了真正的魔法：**归零重启**。

```c
void vm_restart(vm_id_t id) {
    // 1. 重置寄存器状态
    vm[id].mepc = vm[id].reset_vector;
    vm[id].sp = vm[id].stack_top;
    
    // 2. 这里的关键是：不清空内存，不重新加载镜像
    // 就像时光倒流，瞬间回到入口点
    // 耗时：< 1微秒
    execute_mret(); 
}

```

相比于 Docker 的 `fork+exec` (10ms 级) 或 Linux 的重启 (秒级)，这种 `mret` 跳转带来的恢复速度是**纳秒级**的。它实现了**"崩溃即瞬移"**的效果。

---

## 四、 硬件滥用：PMP 的创造性误用

RISC-V 的 **PMP (Physical Memory Protection)** 本意是保护 M-Mode 不受 S-Mode 攻击。但我在这里反向使用它：**用 M-Mode 的 PMP 来隔离多个 S-Mode VM**。

这相当于用硬件寄存器实现了一个轻量级的容器隔离：

| 特性 | Docker (Linux) | 本方案 (PMP) |
| --- | --- | --- |
| **隔离机制** | 软件 (cgroups/namespaces) | 硬件 (总线级拦截) |
| **攻击面** | 巨大 (数百个系统调用) | 极小 (8个 SBI 调用) |
| **性能损耗** | 低 | **零 (硬件并行检查)** |

这看起来是完美的“硬件级容器”。直到我撞上了物理学的墙。

---

## 五、 撞墙：不可逾越的物理天花板

虽然该架构在逻辑上是完美的，但在工程上，它暴露了 RISC-V 标准当前的局限性。评分 **8.5/10** 的原因就在于剩下的 1.5 分被硬件物理限制扣除了。

### 1. 对齐的折磨 (The Torment of Alignment)

PMP 的 NAPOT (Naturally Aligned Power-of-Two) 模式要求内存区域必须是  对齐。

* 如果你需要 12KB 内存，你必须分配 16KB。
* 这导致了严重的**物理内存碎片**。这就像玩俄罗斯方块，但所有的方块都必须是正方形。

### 2. 稀缺的资源 (Slot Exhaustion)

标准 RISC-V 硬件通常只提供 **16 个 PMP 条目**。
这意味着在扣除保护 OpenSBI 自身的条目后，我们最多只能运行 **14-15 个 VM**。这在嵌入式场景尚可，但在服务器场景是不可接受的。

### 3. 原子性的噩梦

在进行 VM 切换时，我们需要刷新 PMP 寄存器。这是一个非原子操作。如果在刷新了一半时触发了 NMI (不可屏蔽中断)，可能会导致权限泄露或系统死锁。M-Mode 的特权既是由于它的全能，也是由于它的**脆弱**。

```ascii

+---------------------------------------------------------------+
|                 RISC-V PMP MEMORY LAYOUT                      |
|          (NAPOT Mode: Naturally Aligned Power-of-Two)         |
+---------------------------------------------------------------+

[ SCENARIO: VM Needs 12KB Memory (0x3000 bytes) ]

      Physical Address      Requirement        Actual PMP Allocation
      ----------------      -----------        ---------------------
      0x80004000  +             ^                       ^
                  |             |                       |
                  |             |                       |
                  |             |                       | WASTED RAM
      0x80003000  +             |                       | (Internal
                  |             | VM Usage              |  Frag.)
                  |             | (12 KB)               |
      0x80002000  +             |                       |
                  |             |                       | ALLOCATED
                  |             |                       | (16 KB)
                  |             |                       | Must be
      0x80001000  +             |                       | Power-of-2
                  |             |                       |
                  |             |                       |
                  |             |                       |
      0x80000000  +             v                       v
      ---------------------------------------------------------------
      
[ THE DILEMMA ]
1. Use 1 PMP Entry (16KB) --> Waste 4KB (25% overhead!)
2. Use 2 PMP Entries (8KB + 4KB) --> Burn limited hardware slots!
   (You only have 16 slots total!)

```
---

## 六、 未来展望：等待 CHERI

这个架构目前的尴尬在于：我们试图用**基于页（Page-based）**的硬件去做**基于对象（Object-based）**的管理。

救世主可能是 **CHERI-RISC-V**。

CHERI 引入了硬件级的 Capability（能力指针）。届时，OpenSBI 不再需要维护复杂的 PMP 表，只需在 VM 启动时颁发一个 `Capability` 指针。

```c
// 未来的 CHERI 代码
void * __capability shared_mem = {
    .base = 0x80000000,
    .length = 0x1000,
    .perms = PERM_READ | PERM_WRITE
};

```

如果 VM 越界，硬件会自动 Trap，无需 M-Mode 介入。这将是 Nanokernel 的终极形态：**从仲裁者退化为分发者**。

---

## 七、 结语

OpenSBI as Nanokernel 可能无法成为下一个 Linux，也无法取代 Docker。但它是一次极具价值的系统架构实验。

它向我们展示了：当我们剥离掉所有历史包袱，直面硬件裸机时，系统可以有多么**简单**，恢复可以有多么**迅速**。同时，它也无情地揭示了：软件的想象力，终究要戴着硬件规范的镣铐跳舞。

这种在物理边界上的探索，正是系统程序员最极致的浪漫。

---

### 下一步行动

* **对于读者**：如果你对 RISC-V 的 PMP 机制感兴趣，欢迎查阅相关规范，或尝试阅读 OpenSBI 源码中的 `lib/sbi/riscv_pmp.c`。
* **对于架构师**：也许我们可以讨论一种 "Shadow PMP" 机制，通过软件换空间，突破16个条目的限制？但这，是下一篇文章的话题了。

