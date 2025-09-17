
# 为什么我后悔折腾 RISC-V？在 Debian 12 上用 QEMU 测试 Fastboot 的血泪史

哎呀，大家好，我是那个自以为聪明，结果把自己坑进 RISC-V 泥潭的傻瓜博主。今天，我来给大家分享一个“简单”的教程：怎么在 Debian 12 上用 QEMU 搭个 RISC-V 虚拟机，然后测试 fastboot。听起来高大上，对吧？开源硬件的未来，Android 开发神器！但现实是，我花了几天时间调试各种莫名其妙的错误，现在回想起来，只想说：谁让我手贱，非要折腾这个玩意儿？Intel 和 ARM 不香吗？非得去追这个“新兴架构”，结果编译 U-Boot 的时候差点砸键盘。

如果你也像我一样，被 RISC-V 的“自由开源”宣传忽悠了，想在虚拟机里玩玩 fastboot 测试固件烧录，那欢迎加入后悔俱乐部。但既然我已经趟过雷了，就把这个血泪流程分享出来，省得你重蹈覆辙。记住，语气会欠揍点，因为我现在还气呢——早知道直接买个 ARM 板子多好。

## 前置：为什么我后悔？
RISC-V 听起来酷炫，但 Debian 12 的支持就是个半成品。仓库里 U-Boot 默认没 fastboot，debootstrap 源天天变，编译还碰上 SWIG、LTO、binman 一堆 bug。内存不够？CPU 不够？网络慢？随便一个都能让你崩溃。我本想测试 Android fastboot，结果成了 Linux 调试大赛。如果你是新手，建议先深呼吸三次，再继续。

系统要求：Debian 12 (amd64)，root 权限，8GB+ 内存，耐心无限。工具一键装：
```bash
sudo apt update && sudo apt install -y qemu-system-misc qemu-utils u-boot-qemu opensbi git debootstrap device-tree-compiler gcc-riscv64-linux-gnu g++-riscv64-linux-gnu build-essential bc bison flex libssl-dev android-sdk-platform-tools-common libncurses-dev python3 swig uuid-dev libgnutls28-dev
```
没装全？别问我为什么这么多——因为 RISC-V 就是爱折腾。

## 步骤 1: 做个磁盘镜像，简单吧？（呵呵）
先造个 4GB raw 镜像，当成虚拟硬盘。以为 dd 就完事？格式化后还得挂载。
```bash
dd if=/dev/zero of=riscv-disk.img bs=1M count=4096
sudo mkfs.ext4 -F riscv-disk.img
sudo mkdir -p /mnt/riscv-root
sudo mount -o loop riscv-disk.img /mnt/riscv-root
```
轻松吧？等等，后面 debootstrap 会让你知道什么是“源不兼容”。

## 步骤 2: debootstrap 根文件系统——源头之痛
RISC-V 的包藏在 unstable 分支，官方源慢？用清华 TUNA！但路径天天变，我试了 debian-ports、sid、unstable，一堆 E: Failed getting release file。
最终方案：
```bash
sudo debootstrap --arch=riscv64 --no-check-gpg unstable /mnt/riscv-root https://mirrors.tuna.tsinghua.edu.cn/debian
```
然后 chroot 配置：
```bash
sudo chroot /mnt/riscv-root /bin/bash
cat >/etc/apt/sources.list <<'EOF'
deb https://mirrors.tuna.tsinghua.edu.cn/debian unstable main
deb https://mirrors.tuna.tsinghua.edu.cn/debian unreleased main
EOF
apt update
apt install -y openssh-server udev fastboot systemd
passwd -d root  # 空密码，懒得输
exit
sudo umount /mnt/riscv-root
```
过程中报 /proc 未挂载？忽略！chroot 就是爱闹腾。为什么后悔？因为 ARM 的 rootfs 一键下载，RISC-V 得自己造。

## 步骤 3: 编译 U-Boot——地狱开始
Debian 自带的 U-Boot 没 fastboot 命令，Unknown command 直接气死你。所以，自编！
```bash
git clone --depth 1 -b v2024.01 https://github.com/u-boot/u-boot.git
cd u-boot
make CROSS_COMPILE=riscv64-linux-gnu- qemu-riscv64_defconfig
cat >>.config <<EOF
CONFIG_CMD_FASTBOOT=y
CONFIG_USB_GADGET=y
CONFIG_USB_GADGET_DOWNLOAD=y
CONFIG_USB_GADGET_VENDOR_NUM=0x18d1
CONFIG_USB_GADGET_PRODUCT_NUM=0xd00d
CONFIG_USB_GADGET_DUALSPEED=y
CONFIG_USB_ETHER=y
CONFIG_USB_ETH_CDC=y
CONFIG_FASTBOOT_BUF_ADDR=0x81000000
CONFIG_FASTBOOT_BUF_SIZE=0x08000000
CONFIG_FASTBOOT_FLASH=y
CONFIG_FASTBOOT_FLASH_MMC_DEV=0
CONFIG_FASTBOOT_UDP=y
EOF
yes "" | make oldconfig
./scripts/config --disable CONFIG_PYLIBFDT --disable CONFIG_BINMAN --disable CONFIG_LTO
sed -i '/^subdir-y.*pylibfdt/d' scripts/dtc/Makefile
echo '#!/bin/bash' > tools/binman/binman && chmod +x tools/binman/binman
make CROSS_COMPILE=riscv64-linux-gnu- -j$(nproc)
cp u-boot.bin ~/u-boot-fastboot.bin
cd ~
```
为什么这么多 hack？因为 pylibfdt SWIG 报错、LTO uleb128 不支持、binman ModuleNotFound——每个都让我想删代码。为什么后悔？因为在 ARM 上，U-Boot 仓库版就带 fastboot！

## 步骤 4: QEMU 启动脚本——端口坑在等你
保存为 run-qemu.sh：
```bash
cat >run-qemu.sh <<'EOF'
#!/bin/bash
exec qemu-system-riscv64 \
  -machine virt \
  -cpu rv64 \
  -smp 4 -m 2G \
  -bios /usr/lib/riscv64-linux-gnu/opensbi/generic/fw_jump.bin \
  -kernel ~/u-boot-fastboot.bin \
  -drive file=riscv-disk.img,format=raw,id=hd0 \
  -device virtio-blk-device,drive=hd0 \
  -netdev user,id=net0,hostfwd=tcp::5555-:5555 \
  -device virtio-net-device,netdev=net0 \
  -nographic
EOF
chmod +x run-qemu.sh
./run-qemu.sh
```
卡死？按回车！TFTP 循环？Ctrl-C！端口占用？`sudo lsof -i :5555` 杀进程，或改 6666。

## 步骤 5: 终于测试 fastboot——值吗？
U-Boot 里：
```bash
=> fastboot udp 0
```
另终端：
```bash
fastboot -s udp 127.0.0.1:5555 devices  # 看到设备？恭喜，你没白折腾
fastboot flash userdata your.img
fastboot reboot
```
成功了？别高兴太早，磁盘没分区，flash 会报错。补 fdisk 吧。

## 常见坑：为什么 RISC-V 让我后悔
- **源错误**：debian-ports 没了，sid/unstable 变来变去，用 TUNA + --no-check-gpg。
- **U-Boot 命令缺失**：仓库版废物，必须自编。
- **编译地狱**：SWIG too few arguments，uleb128 not supported，No module named '_libfdt'——每个都让我想放弃。
- **QEMU 卡死**：-nographic 爱黑屏，加 -serial mon:stdio 试试。
- **端口**：5555 被占？杀进程，或改脚本。为什么后悔？因为 ARM QEMU 一键起飞。
- **整体**：RISC-V 支持太碎，Debian 12 半成品，时间成本高。

## 结语：后悔，但还是分享了
折腾 RISC-V 让我明白：新兴东西别急着追，除非你爱 debug。Intel/ARM 稳定多了，下次我绝对不碰！但如果你非要试，上面流程能救你一命。欢迎评论你的坑，我来陪你哭。为什么欠揍？因为我明明知道会坑，还去试——自作孽，不可活。

（完）  
日期：2025 年 9 月 4 日