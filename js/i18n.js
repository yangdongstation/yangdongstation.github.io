/* Antiphon — interface strings and locale resolution

   Packs are keyed by canonical BCP-47 tag rather than by display name, so one
   registry serves both "which strings to show" and "which script tokens in
   css/tokens.css" to switch on. Display names (简体中文, English, …) survive as
   aliases so a BBG site whose 网站语言 still holds a name keeps working.

   English is the resting language. When no locale can be placed — no detection
   signal, an unrecognised tag, a corrupt stored choice, a blank config — the
   theme shows English. Chinese is never the implicit global fallback: that
   would turn a missing string on a Portuguese or Korean site into Chinese. */
window.Antiphon = window.Antiphon || {};

(function (A) {
  A.I18N = {
    "zh-Hans": {
      NAV_ARTICLES: "文章",
      NAV_ARCHIVE: "归档与标签",
      NAV_FRIENDS: "友人帐",
      SEARCH: "搜索",
      SEARCH_PLACEHOLDER: "搜索文章、标签或摘要…",
      NO_RESULTS: "未找到结果",
      PINNED: "置顶",
      PAGE_PREV: "上一页",
      PAGE_NEXT: "下一页",
      READ_TIME: "约 {n} 分钟",
      REVISED: "修订",
      PREV: "上一篇",
      NEXT: "下一篇",
      REFERENCES: "参考",
      INFO: "提示",
      WARNING: "注意",
      DANGER: "危险",
      SUCCESS: "成功",
      COMMENTS: "留言",
      COMMENTS_UNAVAILABLE: "评论系统未配置",
      COMMENTS_LOAD_FAILED: "评论加载失败",
      COMMENTS_PREVIEW: "预览环境评论不可用",
      LICENSE: "授权",
      LICENSE_RESERVED: "保留所有权利",
      LICENSE_UNLICENSED: "未授权",
      DOWNLOAD: "下载原文",
      COPY: "复制全文",
      COPY_CODE: "复制",
      COPIED: "已复制",
      COPY_FAILED: "复制失败",
      SHARE: "复制链接",
      LINK_COPIED: "链接已复制",
      NOT_FOUND: "页面不存在",
      PASSWORD_PROMPT: "请输入文章密码",
      PASSWORD_SUBMIT: "解锁",
      PASSWORD_WRONG: "密码错误",
      LIGHT_ON: "开灯",
      LIGHT_OFF: "关灯",
      THEME_DAY: "日间",
      THEME_NIGHT: "夜间",
      TOC: "目录",
      BACK_TO_TOP: "回到顶部",
      ANNOUNCEMENT: "网站公告",
      LOADING: "载入中",
      LOAD_ERROR: "无法读取站点数据",
      LOAD_ERROR_HINT: "请通过 BBG 预览，或在站点根目录（与 data/ 同级）访问本主题。",
      MINUTES: "分钟",
      EMPTY: "暂无内容",
      TAG_TITLE: "标签 · “{tag}”",
      CLOSE: "关闭",
      LANG_LABEL: "界面语言",
      LANG_AUTO: "跟随系统",
      FONT_LABEL: "字体",
      NAV_LABEL: "主导航",
      PAGINATION_LABEL: "分页",
      ARTICLE_NAV_LABEL: "文章导航",
      SKIP_TO_CONTENT: "跳到正文",
      HEAD_INDEX: "目录",
      HEAD_ARCHIVE: "归档",
      HEAD_TAGS: "标签",
      HEAD_TOPIC: "主题",
      FOOTER_CREDIT: "由 BBG 与 Antiphon 主题生成",
      SYS_STATUS: "观测进行中",
      SYS_PROTOCOL: "协议 20261001",
      SYS_BOOT: "系统启动",
      FEATURED_FILE: "特藏档案",
      ACCEDE: "调阅档案",
      SEALED: "已封存",
      DISCUSSION_OPEN: "开放讨论",
      CLASSIFIED: "密级",
      UNFILED: "未归档",
      STANDING_PAGE: "常设页面",
      FILE_LABEL: "档案",
      FILE_NO: "档案号 {n}",
      FILE_RECORD: "记录 {n}",
      ENTRY_NO: "第 {n} 号",
      CAT_RECORDED: "存档",
      CAT_EXTENT: "篇幅",
      CAT_SECTIONS: "章节",
      RUBRIC: "类目",
      MARGINALIA: "页边注",
      RECORD_NOT_FOUND: "未找到该记录",
      RETURN_TO_INDEX: "返回目录",
      SEARCH_EYEBROW: "目录 // 检索",
      VISITOR: "访客 0x{id}",
      ATOM_FEED: "Atom 订阅",
      COLOPHON: "版本记 · 卷终",
      CLASS_INDEX: "目录",
      CLASS_RECORD: "记录",
      CLASS_ARCHIVE: "归档",
      CLASS_AFFILIATES: "友人帐",
      CLASS_MISSING: "缺失",
      ARCHIVE_YEARS: "{n} 年",
      ARCHIVE_YEARS_ONE: "{n} 年",
      TAG_SUBJECTS: "{n} 个主题",
      TAG_SUBJECTS_ONE: "{n} 个主题",
      FONT_SAMPLE_ANTIPHON: "如此裁切的纸面",
      FONT_SAMPLE_HUMANIST: "更温润的书版字体",
      FONT_SAMPLE_GROTESK: "实验报告的腔调",
      FONT_SAMPLE_MONO: "万物皆为终端",
      LANG_AUTO_NOW: "当前：{name}"
    },
    "zh-Hant": {
      NAV_ARTICLES: "文章",
      NAV_ARCHIVE: "歸檔與標籤",
      NAV_FRIENDS: "友人帳",
      SEARCH: "搜尋",
      SEARCH_PLACEHOLDER: "搜尋文章、標籤或摘要…",
      NO_RESULTS: "找不到結果",
      PINNED: "置頂",
      PAGE_PREV: "上一頁",
      PAGE_NEXT: "下一頁",
      READ_TIME: "約 {n} 分鐘",
      REVISED: "修訂",
      PREV: "上一篇",
      NEXT: "下一篇",
      REFERENCES: "參考",
      INFO: "提示",
      WARNING: "注意",
      DANGER: "危險",
      SUCCESS: "成功",
      COMMENTS: "留言",
      COMMENTS_UNAVAILABLE: "尚未設定留言系統",
      COMMENTS_LOAD_FAILED: "留言載入失敗",
      COMMENTS_PREVIEW: "預覽環境無法使用留言",
      LICENSE: "授權",
      LICENSE_RESERVED: "保留所有權利",
      LICENSE_UNLICENSED: "未授權",
      DOWNLOAD: "下載原文",
      COPY: "複製全文",
      COPY_CODE: "複製",
      COPIED: "已複製",
      COPY_FAILED: "複製失敗",
      SHARE: "複製連結",
      LINK_COPIED: "連結已複製",
      NOT_FOUND: "頁面不存在",
      PASSWORD_PROMPT: "請輸入文章密碼",
      PASSWORD_SUBMIT: "解鎖",
      PASSWORD_WRONG: "密碼錯誤",
      LIGHT_ON: "開燈",
      LIGHT_OFF: "關燈",
      THEME_DAY: "日間",
      THEME_NIGHT: "夜間",
      TOC: "目錄",
      BACK_TO_TOP: "回到頂端",
      ANNOUNCEMENT: "網站公告",
      LOADING: "載入中",
      LOAD_ERROR: "無法讀取站點資料",
      LOAD_ERROR_HINT: "請透過 BBG 預覽，或在站點根目錄（與 data/ 同層）開啟本主題。",
      MINUTES: "分鐘",
      EMPTY: "暫無內容",
      TAG_TITLE: "標籤 · “{tag}”",
      CLOSE: "關閉",
      LANG_LABEL: "介面語言",
      LANG_AUTO: "跟隨系統",
      FONT_LABEL: "字體",
      NAV_LABEL: "主導覽",
      PAGINATION_LABEL: "分頁",
      ARTICLE_NAV_LABEL: "文章導覽",
      SKIP_TO_CONTENT: "跳至正文",
      HEAD_INDEX: "目錄",
      HEAD_ARCHIVE: "歸檔",
      HEAD_TAGS: "標籤",
      HEAD_TOPIC: "主題",
      FOOTER_CREDIT: "由 BBG 與 Antiphon 主題產生",
      SYS_STATUS: "觀測進行中",
      SYS_PROTOCOL: "協定 20261001",
      SYS_BOOT: "系統啟動",
      FEATURED_FILE: "特藏檔案",
      ACCEDE: "調閱檔案",
      SEALED: "已封存",
      DISCUSSION_OPEN: "開放討論",
      CLASSIFIED: "密級",
      UNFILED: "未歸檔",
      STANDING_PAGE: "常設頁面",
      FILE_LABEL: "檔案",
      FILE_NO: "檔案號 {n}",
      FILE_RECORD: "紀錄 {n}",
      ENTRY_NO: "第 {n} 號",
      CAT_RECORDED: "存檔",
      CAT_EXTENT: "篇幅",
      CAT_SECTIONS: "章節",
      RUBRIC: "類目",
      MARGINALIA: "頁邊註",
      RECORD_NOT_FOUND: "找不到該紀錄",
      RETURN_TO_INDEX: "返回目錄",
      SEARCH_EYEBROW: "目錄 // 檢索",
      VISITOR: "訪客 0x{id}",
      ATOM_FEED: "Atom 訂閱",
      COLOPHON: "版本記 · 卷終",
      CLASS_INDEX: "目錄",
      CLASS_RECORD: "紀錄",
      CLASS_ARCHIVE: "歸檔",
      CLASS_AFFILIATES: "友人帳",
      CLASS_MISSING: "缺失",
      ARCHIVE_YEARS: "{n} 年",
      ARCHIVE_YEARS_ONE: "{n} 年",
      TAG_SUBJECTS: "{n} 個主題",
      TAG_SUBJECTS_ONE: "{n} 個主題",
      FONT_SAMPLE_ANTIPHON: "如此裁切的紙面",
      FONT_SAMPLE_HUMANIST: "更溫潤的書版字體",
      FONT_SAMPLE_GROTESK: "實驗報告的腔調",
      FONT_SAMPLE_MONO: "萬物皆為終端",
      LANG_AUTO_NOW: "目前：{name}"
    },
    ja: {
      NAV_ARTICLES: "記事",
      NAV_ARCHIVE: "アーカイブとタグ",
      NAV_FRIENDS: "友達帳",
      SEARCH: "検索",
      SEARCH_PLACEHOLDER: "記事・タグ・要約を検索…",
      NO_RESULTS: "結果がありません",
      PINNED: "固定",
      PAGE_PREV: "前のページ",
      PAGE_NEXT: "次のページ",
      READ_TIME: "約 {n} 分",
      REVISED: "改訂",
      PREV: "前の記事",
      NEXT: "次の記事",
      REFERENCES: "参考",
      INFO: "ヒント",
      WARNING: "注意",
      DANGER: "危険",
      SUCCESS: "成功",
      COMMENTS: "コメント",
      COMMENTS_UNAVAILABLE: "コメントシステムが未設定です",
      COMMENTS_LOAD_FAILED: "コメントを読み込めません",
      COMMENTS_PREVIEW: "プレビューではコメントを利用できません",
      LICENSE: "ライセンス",
      LICENSE_RESERVED: "無断転載を禁じます",
      LICENSE_UNLICENSED: "ライセンスなし",
      DOWNLOAD: "原文をダウンロード",
      COPY: "全文をコピー",
      COPY_CODE: "コピー",
      COPIED: "コピーしました",
      COPY_FAILED: "コピーできません",
      SHARE: "リンクをコピー",
      LINK_COPIED: "リンクをコピーしました",
      NOT_FOUND: "ページが見つかりません",
      PASSWORD_PROMPT: "記事のパスワードを入力",
      PASSWORD_SUBMIT: "解除",
      PASSWORD_WRONG: "パスワードが違います",
      LIGHT_ON: "灯りを点ける",
      LIGHT_OFF: "灯りを消す",
      THEME_DAY: "昼",
      THEME_NIGHT: "夜",
      TOC: "目次",
      BACK_TO_TOP: "先頭へ",
      ANNOUNCEMENT: "お知らせ",
      LOADING: "読み込み中",
      LOAD_ERROR: "サイトデータを読み込めません",
      LOAD_ERROR_HINT: "BBG のプレビュー、またはサイト直下（data/ と同じ階層）から開いてください。",
      MINUTES: "分",
      EMPTY: "まだ何もありません",
      TAG_TITLE: "タグ · “{tag}”",
      CLOSE: "閉じる",
      LANG_LABEL: "表示言語",
      LANG_AUTO: "システムに従う",
      FONT_LABEL: "書体",
      NAV_LABEL: "メインナビゲーション",
      PAGINATION_LABEL: "ページ送り",
      ARTICLE_NAV_LABEL: "記事ナビゲーション",
      SKIP_TO_CONTENT: "本文へ進む",
      HEAD_INDEX: "目次",
      HEAD_ARCHIVE: "アーカイブ",
      HEAD_TAGS: "タグ",
      HEAD_TOPIC: "主題",
      FOOTER_CREDIT: "BBG と Antiphon テーマにより生成",
      SYS_STATUS: "観測中",
      SYS_PROTOCOL: "プロトコル 20261001",
      SYS_BOOT: "システム起動",
      FEATURED_FILE: "特選ファイル",
      ACCEDE: "ファイルを開く",
      SEALED: "封緘",
      DISCUSSION_OPEN: "コメント受付中",
      CLASSIFIED: "機密",
      UNFILED: "未分類",
      STANDING_PAGE: "固定ページ",
      FILE_LABEL: "ファイル",
      FILE_NO: "ファイル番号 {n}",
      FILE_RECORD: "記録 {n}",
      ENTRY_NO: "第 {n} 号",
      CAT_RECORDED: "記録日",
      CAT_EXTENT: "分量",
      CAT_SECTIONS: "節",
      RUBRIC: "分類",
      MARGINALIA: "傍注",
      RECORD_NOT_FOUND: "記録が見つかりません",
      RETURN_TO_INDEX: "目次へ戻る",
      SEARCH_EYEBROW: "目次 // 検索",
      VISITOR: "閲覧者 0x{id}",
      ATOM_FEED: "Atom フィード",
      COLOPHON: "奥付 · 巻末",
      CLASS_INDEX: "目次",
      CLASS_RECORD: "記録",
      CLASS_ARCHIVE: "アーカイブ",
      CLASS_AFFILIATES: "友人帳",
      CLASS_MISSING: "欠落",
      ARCHIVE_YEARS: "{n} 年",
      ARCHIVE_YEARS_ONE: "{n} 年",
      TAG_SUBJECTS: "{n} 件の主題",
      TAG_SUBJECTS_ONE: "{n} 件の主題",
      FONT_SAMPLE_ANTIPHON: "断ち落とされたままの紙面",
      FONT_SAMPLE_HUMANIST: "より温かい書籍体",
      FONT_SAMPLE_GROTESK: "実験報告の声",
      FONT_SAMPLE_MONO: "すべては端末である",
      LANG_AUTO_NOW: "現在：{name}"
    },
    en: {
      NAV_ARTICLES: "Articles",
      NAV_ARCHIVE: "Archive & tags",
      NAV_FRIENDS: "Friends",
      SEARCH: "Search",
      SEARCH_PLACEHOLDER: "Search titles, tags or excerpts…",
      NO_RESULTS: "No results",
      PINNED: "Pinned",
      PAGE_PREV: "Previous page",
      PAGE_NEXT: "Next page",
      READ_TIME: "About {n} min",
      REVISED: "Revised",
      PREV: "Previous",
      NEXT: "Next",
      REFERENCES: "References",
      INFO: "Note",
      WARNING: "Warning",
      DANGER: "Danger",
      SUCCESS: "Success",
      COMMENTS: "Comments",
      COMMENTS_UNAVAILABLE: "No comment system configured",
      COMMENTS_LOAD_FAILED: "Could not load comments",
      COMMENTS_PREVIEW: "Comments are unavailable in preview",
      LICENSE: "License",
      LICENSE_RESERVED: "All rights reserved",
      LICENSE_UNLICENSED: "Unlicensed",
      DOWNLOAD: "Download source",
      COPY: "Copy text",
      COPY_CODE: "Copy",
      COPIED: "Copied",
      COPY_FAILED: "Copy failed",
      SHARE: "Copy link",
      LINK_COPIED: "Link copied",
      NOT_FOUND: "Page not found",
      PASSWORD_PROMPT: "Enter the article password",
      PASSWORD_SUBMIT: "Unlock",
      PASSWORD_WRONG: "Wrong password",
      LIGHT_ON: "Turn light on",
      LIGHT_OFF: "Turn light off",
      THEME_DAY: "Day",
      THEME_NIGHT: "Night",
      TOC: "Contents",
      BACK_TO_TOP: "Back to top",
      ANNOUNCEMENT: "Announcement",
      LOADING: "Loading",
      LOAD_ERROR: "Could not read site data",
      LOAD_ERROR_HINT: "Open the theme through BBG preview, or from the site root beside the data/ directory.",
      MINUTES: "min",
      EMPTY: "Nothing here yet",
      TAG_TITLE: "Tag · “{tag}”",
      CLOSE: "Close",
      LANG_LABEL: "Language",
      LANG_AUTO: "Follow system",
      FONT_LABEL: "Typeface",
      NAV_LABEL: "Main navigation",
      PAGINATION_LABEL: "Pagination",
      ARTICLE_NAV_LABEL: "Article navigation",
      SKIP_TO_CONTENT: "Skip to content",
      HEAD_INDEX: "Contents",
      HEAD_ARCHIVE: "Archive",
      HEAD_TAGS: "Tags",
      HEAD_TOPIC: "Topic",
      FOOTER_CREDIT: "Generated by BBG and the Antiphon theme",
      SYS_STATUS: "Observation active",
      SYS_PROTOCOL: "Protocol 20261001",
      SYS_BOOT: "System boot",
      FEATURED_FILE: "Featured file",
      ACCEDE: "Open file",
      SEALED: "Sealed",
      DISCUSSION_OPEN: "Comments open",
      CLASSIFIED: "Classified",
      UNFILED: "Unfiled",
      STANDING_PAGE: "Standing page",
      FILE_LABEL: "File",
      FILE_NO: "File no. {n}",
      FILE_RECORD: "Record {n}",
      ENTRY_NO: "No. {n}",
      CAT_RECORDED: "Recorded",
      CAT_EXTENT: "Extent",
      CAT_SECTIONS: "Sections",
      RUBRIC: "Rubric",
      MARGINALIA: "Marginalia",
      RECORD_NOT_FOUND: "Record not found",
      RETURN_TO_INDEX: "Return to index",
      SEARCH_EYEBROW: "Index // access",
      VISITOR: "Visitor 0x{id}",
      ATOM_FEED: "Atom feed",
      COLOPHON: "Colophon · end of file",
      CLASS_INDEX: "Index",
      CLASS_RECORD: "Record",
      CLASS_ARCHIVE: "Archive",
      CLASS_AFFILIATES: "Affiliates",
      CLASS_MISSING: "Missing",
      ARCHIVE_YEARS: "{n} years",
      ARCHIVE_YEARS_ONE: "{n} year",
      TAG_SUBJECTS: "{n} subjects",
      TAG_SUBJECTS_ONE: "{n} subject",
      FONT_SAMPLE_ANTIPHON: "The sheet as it was cut",
      FONT_SAMPLE_HUMANIST: "A warmer, slabby book face",
      FONT_SAMPLE_GROTESK: "The lab report voice",
      FONT_SAMPLE_MONO: "Everything is a terminal",
      LANG_AUTO_NOW: "Now: {name}"
    },
    ko: {
      NAV_ARTICLES: "글",
      NAV_ARCHIVE: "보관함과 태그",
      NAV_FRIENDS: "벗들의 장부",
      SEARCH: "검색",
      SEARCH_PLACEHOLDER: "글·태그·요약 검색…",
      NO_RESULTS: "결과가 없습니다",
      PINNED: "고정",
      PAGE_PREV: "이전 페이지",
      PAGE_NEXT: "다음 페이지",
      READ_TIME: "약 {n}분",
      REVISED: "개정",
      PREV: "이전 글",
      NEXT: "다음 글",
      REFERENCES: "참고",
      INFO: "안내",
      WARNING: "주의",
      DANGER: "위험",
      SUCCESS: "성공",
      COMMENTS: "댓글",
      COMMENTS_UNAVAILABLE: "댓글 시스템이 설정되지 않았습니다",
      COMMENTS_LOAD_FAILED: "댓글을 불러오지 못했습니다",
      COMMENTS_PREVIEW: "미리보기에서는 댓글을 쓸 수 없습니다",
      LICENSE: "라이선스",
      LICENSE_RESERVED: "모든 권리 보유",
      LICENSE_UNLICENSED: "라이선스 없음",
      DOWNLOAD: "원문 내려받기",
      COPY: "전체 복사",
      COPY_CODE: "복사",
      COPIED: "복사됨",
      COPY_FAILED: "복사 실패",
      SHARE: "링크 복사",
      LINK_COPIED: "링크를 복사했습니다",
      NOT_FOUND: "페이지를 찾을 수 없습니다",
      PASSWORD_PROMPT: "글 비밀번호를 입력하세요",
      PASSWORD_SUBMIT: "잠금 해제",
      PASSWORD_WRONG: "비밀번호가 틀립니다",
      LIGHT_ON: "불 켜기",
      LIGHT_OFF: "불 끄기",
      THEME_DAY: "낮",
      THEME_NIGHT: "밤",
      TOC: "목차",
      BACK_TO_TOP: "맨 위로",
      ANNOUNCEMENT: "공지",
      LOADING: "불러오는 중",
      LOAD_ERROR: "사이트 데이터를 읽을 수 없습니다",
      LOAD_ERROR_HINT: "BBG 미리보기로 열거나 data/ 폴더와 같은 위치인 사이트 최상위에서 여세요.",
      MINUTES: "분",
      EMPTY: "아직 내용이 없습니다",
      TAG_TITLE: "태그 · “{tag}”",
      CLOSE: "닫기",
      LANG_LABEL: "언어",
      LANG_AUTO: "시스템 설정 따르기",
      FONT_LABEL: "서체",
      NAV_LABEL: "주 메뉴",
      PAGINATION_LABEL: "페이지 이동",
      ARTICLE_NAV_LABEL: "글 이동",
      SKIP_TO_CONTENT: "본문으로 건너뛰기",
      HEAD_INDEX: "목차",
      HEAD_ARCHIVE: "보관함",
      HEAD_TAGS: "태그",
      HEAD_TOPIC: "주제",
      FOOTER_CREDIT: "BBG와 Antiphon 테마로 생성",
      SYS_STATUS: "관측 진행 중",
      SYS_PROTOCOL: "프로토콜 20261001",
      SYS_BOOT: "시스템 부팅",
      FEATURED_FILE: "특별 자료",
      ACCEDE: "자료 열람",
      SEALED: "봉인됨",
      DISCUSSION_OPEN: "댓글 열림",
      CLASSIFIED: "기밀",
      UNFILED: "미분류",
      STANDING_PAGE: "상설 페이지",
      FILE_LABEL: "문서",
      FILE_NO: "문서 번호 {n}",
      FILE_RECORD: "기록 {n}",
      ENTRY_NO: "제 {n} 호",
      CAT_RECORDED: "기록일",
      CAT_EXTENT: "분량",
      CAT_SECTIONS: "절",
      RUBRIC: "분류",
      MARGINALIA: "여백주",
      RECORD_NOT_FOUND: "기록을 찾을 수 없습니다",
      RETURN_TO_INDEX: "목차로 돌아가기",
      SEARCH_EYEBROW: "목차 // 검색",
      VISITOR: "방문자 0x{id}",
      ATOM_FEED: "Atom 피드",
      COLOPHON: "판권 · 권말",
      CLASS_INDEX: "목차",
      CLASS_RECORD: "기록",
      CLASS_ARCHIVE: "보관함",
      CLASS_AFFILIATES: "벗들의 장부",
      CLASS_MISSING: "누락",
      ARCHIVE_YEARS: "{n}년",
      ARCHIVE_YEARS_ONE: "{n}년",
      TAG_SUBJECTS: "주제 {n}개",
      TAG_SUBJECTS_ONE: "주제 {n}개",
      FONT_SAMPLE_ANTIPHON: "잘라낸 그대로의 종이",
      FONT_SAMPLE_HUMANIST: "더 따뜻한 책체",
      FONT_SAMPLE_GROTESK: "실험 보고서의 목소리",
      FONT_SAMPLE_MONO: "모든 것은 터미널이다",
      LANG_AUTO_NOW: "현재: {name}"
    },
    pt: {
      NAV_ARTICLES: "Artigos",
      NAV_ARCHIVE: "Arquivo e etiquetas",
      NAV_FRIENDS: "Amigos",
      SEARCH: "Pesquisar",
      SEARCH_PLACEHOLDER: "Pesquisar títulos, etiquetas ou resumos…",
      NO_RESULTS: "Nenhum resultado",
      PINNED: "Fixado",
      PAGE_PREV: "Página anterior",
      PAGE_NEXT: "Próxima página",
      READ_TIME: "Cerca de {n} min",
      REVISED: "Revisto",
      PREV: "Anterior",
      NEXT: "Seguinte",
      REFERENCES: "Referências",
      INFO: "Nota",
      WARNING: "Aviso",
      DANGER: "Perigo",
      SUCCESS: "Sucesso",
      COMMENTS: "Comentários",
      COMMENTS_UNAVAILABLE: "Nenhum sistema de comentários configurado",
      COMMENTS_LOAD_FAILED: "Não foi possível carregar os comentários",
      COMMENTS_PREVIEW: "Comentários indisponíveis na pré-visualização",
      LICENSE: "Licença",
      LICENSE_RESERVED: "Todos os direitos reservados",
      LICENSE_UNLICENSED: "Sem licença",
      DOWNLOAD: "Baixar original",
      COPY: "Copiar texto",
      COPY_CODE: "Copiar",
      COPIED: "Copiado",
      COPY_FAILED: "Falha ao copiar",
      SHARE: "Copiar link",
      LINK_COPIED: "Link copiado",
      NOT_FOUND: "Página não encontrada",
      PASSWORD_PROMPT: "Digite a senha do artigo",
      PASSWORD_SUBMIT: "Desbloquear",
      PASSWORD_WRONG: "Senha incorreta",
      LIGHT_ON: "Acender a luz",
      LIGHT_OFF: "Apagar a luz",
      THEME_DAY: "Dia",
      THEME_NIGHT: "Noite",
      TOC: "Índice",
      BACK_TO_TOP: "Voltar ao topo",
      ANNOUNCEMENT: "Aviso do site",
      LOADING: "Carregando",
      LOAD_ERROR: "Não foi possível ler os dados do site",
      LOAD_ERROR_HINT: "Abra o tema pela pré-visualização do BBG ou a partir da raiz do site, junto da pasta data/.",
      MINUTES: "min",
      EMPTY: "Ainda não há nada",
      TAG_TITLE: "Etiqueta · “{tag}”",
      CLOSE: "Fechar",
      LANG_LABEL: "Idioma",
      LANG_AUTO: "Seguir o sistema",
      FONT_LABEL: "Tipografia",
      NAV_LABEL: "Navegação principal",
      PAGINATION_LABEL: "Paginação",
      ARTICLE_NAV_LABEL: "Navegação do artigo",
      SKIP_TO_CONTENT: "Ir para o conteúdo",
      HEAD_INDEX: "Índice",
      HEAD_ARCHIVE: "Arquivo",
      HEAD_TAGS: "Etiquetas",
      HEAD_TOPIC: "Tema",
      FOOTER_CREDIT: "Gerado por BBG e pelo tema Antiphon",
      SYS_STATUS: "Observação em curso",
      SYS_PROTOCOL: "Protocolo 20261001",
      SYS_BOOT: "Início do sistema",
      FEATURED_FILE: "Documento em destaque",
      ACCEDE: "Abrir documento",
      SEALED: "Selado",
      DISCUSSION_OPEN: "Comentários abertos",
      CLASSIFIED: "Classificado",
      UNFILED: "Sem classificação",
      STANDING_PAGE: "Página permanente",
      FILE_LABEL: "Documento",
      FILE_NO: "Documento n.º {n}",
      FILE_RECORD: "Registo {n}",
      ENTRY_NO: "N.º {n}",
      CAT_RECORDED: "Registado",
      CAT_EXTENT: "Extensão",
      CAT_SECTIONS: "Secções",
      RUBRIC: "Rubrica",
      MARGINALIA: "Marginalia",
      RECORD_NOT_FOUND: "Registo não encontrado",
      RETURN_TO_INDEX: "Voltar ao índice",
      SEARCH_EYEBROW: "Índice // acesso",
      VISITOR: "Visitante 0x{id}",
      ATOM_FEED: "Feed Atom",
      COLOPHON: "Colofão · fim do documento",
      CLASS_INDEX: "Índice",
      CLASS_RECORD: "Registo",
      CLASS_ARCHIVE: "Arquivo",
      CLASS_AFFILIATES: "Afiliados",
      CLASS_MISSING: "Em falta",
      ARCHIVE_YEARS: "{n} anos",
      ARCHIVE_YEARS_ONE: "{n} ano",
      TAG_SUBJECTS: "{n} assuntos",
      TAG_SUBJECTS_ONE: "{n} assunto",
      FONT_SAMPLE_ANTIPHON: "A folha tal como foi cortada",
      FONT_SAMPLE_HUMANIST: "Um grão de livro mais quente",
      FONT_SAMPLE_GROTESK: "A voz do relatório de laboratório",
      FONT_SAMPLE_MONO: "Tudo é um terminal",
      LANG_AUTO_NOW: "Agora: {name}"
    },
    es: {
      NAV_ARTICLES: "Artículos",
      NAV_ARCHIVE: "Archivo y etiquetas",
      NAV_FRIENDS: "Amigos",
      SEARCH: "Buscar",
      SEARCH_PLACEHOLDER: "Buscar títulos, etiquetas o resúmenes…",
      NO_RESULTS: "Sin resultados",
      PINNED: "Fijado",
      PAGE_PREV: "Página anterior",
      PAGE_NEXT: "Página siguiente",
      READ_TIME: "Unos {n} min",
      REVISED: "Revisado",
      PREV: "Anterior",
      NEXT: "Siguiente",
      REFERENCES: "Referencias",
      INFO: "Nota",
      WARNING: "Advertencia",
      DANGER: "Peligro",
      SUCCESS: "Éxito",
      COMMENTS: "Comentarios",
      COMMENTS_UNAVAILABLE: "No hay sistema de comentarios configurado",
      COMMENTS_LOAD_FAILED: "No se pudieron cargar los comentarios",
      COMMENTS_PREVIEW: "Los comentarios no están disponibles en la vista previa",
      LICENSE: "Licencia",
      LICENSE_RESERVED: "Todos los derechos reservados",
      LICENSE_UNLICENSED: "Sin licencia",
      DOWNLOAD: "Descargar original",
      COPY: "Copiar texto",
      COPY_CODE: "Copiar",
      COPIED: "Copiado",
      COPY_FAILED: "No se pudo copiar",
      SHARE: "Copiar enlace",
      LINK_COPIED: "Enlace copiado",
      NOT_FOUND: "Página no encontrada",
      PASSWORD_PROMPT: "Introduce la contraseña del artículo",
      PASSWORD_SUBMIT: "Desbloquear",
      PASSWORD_WRONG: "Contraseña incorrecta",
      LIGHT_ON: "Encender la luz",
      LIGHT_OFF: "Apagar la luz",
      THEME_DAY: "Día",
      THEME_NIGHT: "Noche",
      TOC: "Índice",
      BACK_TO_TOP: "Volver arriba",
      ANNOUNCEMENT: "Anuncio del sitio",
      LOADING: "Cargando",
      LOAD_ERROR: "No se pudieron leer los datos del sitio",
      LOAD_ERROR_HINT: "Abre el tema desde la vista previa de BBG o desde la raíz del sitio, junto a la carpeta data/.",
      MINUTES: "min",
      EMPTY: "Aún no hay nada",
      TAG_TITLE: "Etiqueta · “{tag}”",
      CLOSE: "Cerrar",
      LANG_LABEL: "Idioma",
      LANG_AUTO: "Seguir el sistema",
      FONT_LABEL: "Tipografía",
      NAV_LABEL: "Navegación principal",
      PAGINATION_LABEL: "Paginación",
      ARTICLE_NAV_LABEL: "Navegación del artículo",
      SKIP_TO_CONTENT: "Ir al contenido",
      HEAD_INDEX: "Índice",
      HEAD_ARCHIVE: "Archivo",
      HEAD_TAGS: "Etiquetas",
      HEAD_TOPIC: "Tema",
      FOOTER_CREDIT: "Generado por BBG y el tema Antiphon",
      SYS_STATUS: "Observación en curso",
      SYS_PROTOCOL: "Protocolo 20261001",
      SYS_BOOT: "Arranque del sistema",
      FEATURED_FILE: "Documento destacado",
      ACCEDE: "Abrir documento",
      SEALED: "Sellado",
      DISCUSSION_OPEN: "Comentarios abiertos",
      CLASSIFIED: "Clasificado",
      UNFILED: "Sin clasificar",
      STANDING_PAGE: "Página permanente",
      FILE_LABEL: "Documento",
      FILE_NO: "Documento n.º {n}",
      FILE_RECORD: "Registro {n}",
      ENTRY_NO: "N.º {n}",
      CAT_RECORDED: "Registrado",
      CAT_EXTENT: "Extensión",
      CAT_SECTIONS: "Secciones",
      RUBRIC: "Rúbrica",
      MARGINALIA: "Marginalia",
      RECORD_NOT_FOUND: "Registro no encontrado",
      RETURN_TO_INDEX: "Volver al índice",
      SEARCH_EYEBROW: "Índice // acceso",
      VISITOR: "Visitante 0x{id}",
      ATOM_FEED: "Canal Atom",
      COLOPHON: "Colofón · fin del archivo",
      CLASS_INDEX: "Índice",
      CLASS_RECORD: "Registro",
      CLASS_ARCHIVE: "Archivo",
      CLASS_AFFILIATES: "Afiliados",
      CLASS_MISSING: "Faltante",
      ARCHIVE_YEARS: "{n} años",
      ARCHIVE_YEARS_ONE: "{n} año",
      TAG_SUBJECTS: "{n} temas",
      TAG_SUBJECTS_ONE: "{n} tema",
      FONT_SAMPLE_ANTIPHON: "La hoja tal como se cortó",
      FONT_SAMPLE_HUMANIST: "Una letra de libro más cálida",
      FONT_SAMPLE_GROTESK: "La voz del informe de laboratorio",
      FONT_SAMPLE_MONO: "Todo es un terminal",
      LANG_AUTO_NOW: "Ahora: {name}"
    },
    fr: {
      NAV_ARTICLES: "Articles",
      NAV_ARCHIVE: "Archives et étiquettes",
      NAV_FRIENDS: "Amis",
      SEARCH: "Rechercher",
      SEARCH_PLACEHOLDER: "Rechercher titres, étiquettes ou résumés…",
      NO_RESULTS: "Aucun résultat",
      PINNED: "Épinglé",
      PAGE_PREV: "Page précédente",
      PAGE_NEXT: "Page suivante",
      READ_TIME: "Environ {n} min",
      REVISED: "Révisé",
      PREV: "Précédent",
      NEXT: "Suivant",
      REFERENCES: "Références",
      INFO: "Note",
      WARNING: "Avertissement",
      DANGER: "Danger",
      SUCCESS: "Succès",
      COMMENTS: "Commentaires",
      COMMENTS_UNAVAILABLE: "Aucun système de commentaires configuré",
      COMMENTS_LOAD_FAILED: "Impossible de charger les commentaires",
      COMMENTS_PREVIEW: "Commentaires indisponibles en aperçu",
      LICENSE: "Licence",
      LICENSE_RESERVED: "Tous droits réservés",
      LICENSE_UNLICENSED: "Sans licence",
      DOWNLOAD: "Télécharger l’original",
      COPY: "Copier le texte",
      COPY_CODE: "Copier",
      COPIED: "Copié",
      COPY_FAILED: "Échec de la copie",
      SHARE: "Copier le lien",
      LINK_COPIED: "Lien copié",
      NOT_FOUND: "Page introuvable",
      PASSWORD_PROMPT: "Saisissez le mot de passe de l’article",
      PASSWORD_SUBMIT: "Déverrouiller",
      PASSWORD_WRONG: "Mot de passe incorrect",
      LIGHT_ON: "Allumer la lumière",
      LIGHT_OFF: "Éteindre la lumière",
      THEME_DAY: "Jour",
      THEME_NIGHT: "Nuit",
      TOC: "Sommaire",
      BACK_TO_TOP: "Retour en haut",
      ANNOUNCEMENT: "Annonce du site",
      LOADING: "Chargement",
      LOAD_ERROR: "Impossible de lire les données du site",
      LOAD_ERROR_HINT: "Ouvrez le thème via l’aperçu BBG, ou depuis la racine du site, à côté du dossier data/.",
      MINUTES: "min",
      EMPTY: "Rien pour l’instant",
      TAG_TITLE: "Étiquette · “{tag}”",
      CLOSE: "Fermer",
      LANG_LABEL: "Langue",
      LANG_AUTO: "Suivre le système",
      FONT_LABEL: "Police",
      NAV_LABEL: "Navigation principale",
      PAGINATION_LABEL: "Pagination",
      ARTICLE_NAV_LABEL: "Navigation de l’article",
      SKIP_TO_CONTENT: "Aller au contenu",
      HEAD_INDEX: "Sommaire",
      HEAD_ARCHIVE: "Archives",
      HEAD_TAGS: "Étiquettes",
      HEAD_TOPIC: "Thème",
      FOOTER_CREDIT: "Généré par BBG et le thème Antiphon",
      SYS_STATUS: "Observation en cours",
      SYS_PROTOCOL: "Protocole 20261001",
      SYS_BOOT: "Démarrage du système",
      FEATURED_FILE: "Document à la une",
      ACCEDE: "Ouvrir le document",
      SEALED: "Scellé",
      DISCUSSION_OPEN: "Commentaires ouverts",
      CLASSIFIED: "Classifié",
      UNFILED: "Non classé",
      STANDING_PAGE: "Page permanente",
      FILE_LABEL: "Document",
      FILE_NO: "Document n° {n}",
      FILE_RECORD: "Registre {n}",
      ENTRY_NO: "N° {n}",
      CAT_RECORDED: "Enregistré",
      CAT_EXTENT: "Étendue",
      CAT_SECTIONS: "Sections",
      RUBRIC: "Rubrique",
      MARGINALIA: "Marginalia",
      RECORD_NOT_FOUND: "Registre introuvable",
      RETURN_TO_INDEX: "Retour à l’index",
      SEARCH_EYEBROW: "Index // accès",
      VISITOR: "Visiteur 0x{id}",
      ATOM_FEED: "Flux Atom",
      COLOPHON: "Colophon · fin du document",
      CLASS_INDEX: "Index",
      CLASS_RECORD: "Registre",
      CLASS_ARCHIVE: "Archives",
      CLASS_AFFILIATES: "Affiliés",
      CLASS_MISSING: "Manquant",
      ARCHIVE_YEARS: "{n} ans",
      ARCHIVE_YEARS_ONE: "{n} an",
      TAG_SUBJECTS: "{n} sujets",
      TAG_SUBJECTS_ONE: "{n} sujet",
      FONT_SAMPLE_ANTIPHON: "La feuille telle qu’elle fut coupée",
      FONT_SAMPLE_HUMANIST: "Un œil de livre plus chaleureux",
      FONT_SAMPLE_GROTESK: "La voix du rapport de laboratoire",
      FONT_SAMPLE_MONO: "Tout est un terminal",
      LANG_AUTO_NOW: "Actuel : {name}"
    },
    de: {
      NAV_ARTICLES: "Artikel",
      NAV_ARCHIVE: "Archiv und Schlagwörter",
      NAV_FRIENDS: "Freunde",
      SEARCH: "Suche",
      SEARCH_PLACEHOLDER: "Titel, Schlagwörter oder Auszüge suchen…",
      NO_RESULTS: "Keine Ergebnisse",
      PINNED: "Angeheftet",
      PAGE_PREV: "Vorherige Seite",
      PAGE_NEXT: "Nächste Seite",
      READ_TIME: "Etwa {n} Min.",
      REVISED: "Überarbeitet",
      PREV: "Vorheriger",
      NEXT: "Nächster",
      REFERENCES: "Quellen",
      INFO: "Hinweis",
      WARNING: "Achtung",
      DANGER: "Gefahr",
      SUCCESS: "Erfolg",
      COMMENTS: "Kommentare",
      COMMENTS_UNAVAILABLE: "Kein Kommentarsystem eingerichtet",
      COMMENTS_LOAD_FAILED: "Kommentare konnten nicht geladen werden",
      COMMENTS_PREVIEW: "Kommentare sind in der Vorschau nicht verfügbar",
      LICENSE: "Lizenz",
      LICENSE_RESERVED: "Alle Rechte vorbehalten",
      LICENSE_UNLICENSED: "Nicht lizenziert",
      DOWNLOAD: "Original herunterladen",
      COPY: "Text kopieren",
      COPY_CODE: "Kopieren",
      COPIED: "Kopiert",
      COPY_FAILED: "Kopieren fehlgeschlagen",
      SHARE: "Link kopieren",
      LINK_COPIED: "Link kopiert",
      NOT_FOUND: "Seite nicht gefunden",
      PASSWORD_PROMPT: "Bitte das Passwort des Artikels eingeben",
      PASSWORD_SUBMIT: "Entsperren",
      PASSWORD_WRONG: "Falsches Passwort",
      LIGHT_ON: "Licht einschalten",
      LIGHT_OFF: "Licht ausschalten",
      THEME_DAY: "Tag",
      THEME_NIGHT: "Nacht",
      TOC: "Inhalt",
      BACK_TO_TOP: "Nach oben",
      ANNOUNCEMENT: "Website-Hinweis",
      LOADING: "Lädt",
      LOAD_ERROR: "Seitendaten konnten nicht gelesen werden",
      LOAD_ERROR_HINT: "Öffne das Theme über die BBG-Vorschau oder aus dem Site-Stammverzeichnis neben dem Ordner data/.",
      MINUTES: "Min.",
      EMPTY: "Noch nichts vorhanden",
      TAG_TITLE: "Schlagwort · „{tag}“",
      CLOSE: "Schließen",
      LANG_LABEL: "Sprache",
      LANG_AUTO: "Systemeinstellung folgen",
      FONT_LABEL: "Schrift",
      NAV_LABEL: "Hauptnavigation",
      PAGINATION_LABEL: "Seitennavigation",
      ARTICLE_NAV_LABEL: "Artikelnavigation",
      SKIP_TO_CONTENT: "Zum Inhalt springen",
      HEAD_INDEX: "Inhalt",
      HEAD_ARCHIVE: "Archiv",
      HEAD_TAGS: "Schlagwörter",
      HEAD_TOPIC: "Thema",
      FOOTER_CREDIT: "Erzeugt mit BBG und dem Antiphon-Theme",
      SYS_STATUS: "Beobachtung läuft",
      SYS_PROTOCOL: "Protokoll 20261001",
      SYS_BOOT: "Systemstart",
      FEATURED_FILE: "Hervorgehobene Akte",
      ACCEDE: "Akte öffnen",
      SEALED: "Versiegelt",
      DISCUSSION_OPEN: "Kommentare offen",
      CLASSIFIED: "Eingestuft",
      UNFILED: "Ungeordnet",
      STANDING_PAGE: "Feste Seite",
      FILE_LABEL: "Akte",
      FILE_NO: "Akte Nr. {n}",
      FILE_RECORD: "Eintrag {n}",
      ENTRY_NO: "Nr. {n}",
      CAT_RECORDED: "Erfasst",
      CAT_EXTENT: "Umfang",
      CAT_SECTIONS: "Abschnitte",
      RUBRIC: "Rubrik",
      MARGINALIA: "Marginalien",
      RECORD_NOT_FOUND: "Eintrag nicht gefunden",
      RETURN_TO_INDEX: "Zurück zum Verzeichnis",
      SEARCH_EYEBROW: "Verzeichnis // Zugriff",
      VISITOR: "Besucher 0x{id}",
      ATOM_FEED: "Atom-Feed",
      COLOPHON: "Kolophon · Ende der Akte",
      CLASS_INDEX: "Verzeichnis",
      CLASS_RECORD: "Eintrag",
      CLASS_ARCHIVE: "Archiv",
      CLASS_AFFILIATES: "Verbündete",
      CLASS_MISSING: "Fehlt",
      ARCHIVE_YEARS: "{n} Jahre",
      ARCHIVE_YEARS_ONE: "{n} Jahr",
      TAG_SUBJECTS: "{n} Themen",
      TAG_SUBJECTS_ONE: "{n} Thema",
      FONT_SAMPLE_ANTIPHON: "Das Blatt, wie es geschnitten wurde",
      FONT_SAMPLE_HUMANIST: "Eine wärmere Buchschrift",
      FONT_SAMPLE_GROTESK: "Die Stimme des Laborberichts",
      FONT_SAMPLE_MONO: "Alles ist ein Terminal",
      LANG_AUTO_NOW: "Aktuell: {name}"
    },
    ru: {
      NAV_ARTICLES: "Статьи",
      NAV_ARCHIVE: "Архив и метки",
      NAV_FRIENDS: "Друзья",
      SEARCH: "Поиск",
      SEARCH_PLACEHOLDER: "Поиск по заголовкам, меткам и аннотациям…",
      NO_RESULTS: "Ничего не найдено",
      PINNED: "Закреплено",
      PAGE_PREV: "Предыдущая страница",
      PAGE_NEXT: "Следующая страница",
      READ_TIME: "Около {n} мин",
      REVISED: "Изменено",
      PREV: "Предыдущая",
      NEXT: "Следующая",
      REFERENCES: "Источники",
      INFO: "Примечание",
      WARNING: "Внимание",
      DANGER: "Опасность",
      SUCCESS: "Готово",
      COMMENTS: "Комментарии",
      COMMENTS_UNAVAILABLE: "Система комментариев не настроена",
      COMMENTS_LOAD_FAILED: "Не удалось загрузить комментарии",
      COMMENTS_PREVIEW: "Комментарии недоступны в предпросмотре",
      LICENSE: "Лицензия",
      LICENSE_RESERVED: "Все права защищены",
      LICENSE_UNLICENSED: "Без лицензии",
      DOWNLOAD: "Скачать оригинал",
      COPY: "Копировать текст",
      COPY_CODE: "Копировать",
      COPIED: "Скопировано",
      COPY_FAILED: "Не удалось скопировать",
      SHARE: "Копировать ссылку",
      LINK_COPIED: "Ссылка скопирована",
      NOT_FOUND: "Страница не найдена",
      PASSWORD_PROMPT: "Введите пароль статьи",
      PASSWORD_SUBMIT: "Разблокировать",
      PASSWORD_WRONG: "Неверный пароль",
      LIGHT_ON: "Включить свет",
      LIGHT_OFF: "Выключить свет",
      THEME_DAY: "День",
      THEME_NIGHT: "Ночь",
      TOC: "Содержание",
      BACK_TO_TOP: "Наверх",
      ANNOUNCEMENT: "Объявление сайта",
      LOADING: "Загрузка",
      LOAD_ERROR: "Не удалось прочитать данные сайта",
      LOAD_ERROR_HINT: "Откройте тему через предпросмотр BBG или из корня сайта, рядом с папкой data/.",
      MINUTES: "мин",
      EMPTY: "Пока ничего нет",
      TAG_TITLE: "Метка · «{tag}»",
      CLOSE: "Закрыть",
      LANG_LABEL: "Язык",
      LANG_AUTO: "Как в системе",
      FONT_LABEL: "Шрифт",
      NAV_LABEL: "Основная навигация",
      PAGINATION_LABEL: "Постраничная навигация",
      ARTICLE_NAV_LABEL: "Навигация по статьям",
      SKIP_TO_CONTENT: "Перейти к содержанию",
      HEAD_INDEX: "Содержание",
      HEAD_ARCHIVE: "Архив",
      HEAD_TAGS: "Метки",
      HEAD_TOPIC: "Тема",
      FOOTER_CREDIT: "Создано с BBG и темой Antiphon",
      SYS_STATUS: "Наблюдение идёт",
      SYS_PROTOCOL: "Протокол 20261001",
      SYS_BOOT: "Запуск системы",
      FEATURED_FILE: "Избранное дело",
      ACCEDE: "Открыть дело",
      SEALED: "Запечатано",
      DISCUSSION_OPEN: "Обсуждение открыто",
      CLASSIFIED: "Секретно",
      UNFILED: "Не разобрано",
      STANDING_PAGE: "Постоянная страница",
      FILE_LABEL: "Дело",
      FILE_NO: "Дело № {n}",
      FILE_RECORD: "Запись {n}",
      ENTRY_NO: "№ {n}",
      CAT_RECORDED: "Записано",
      CAT_EXTENT: "Объём",
      CAT_SECTIONS: "Разделы",
      RUBRIC: "Рубрика",
      MARGINALIA: "Маргиналии",
      RECORD_NOT_FOUND: "Запись не найдена",
      RETURN_TO_INDEX: "Вернуться к указателю",
      SEARCH_EYEBROW: "Указатель // доступ",
      VISITOR: "Посетитель 0x{id}",
      ATOM_FEED: "Лента Atom",
      COLOPHON: "Колофон · конец дела",
      CLASS_INDEX: "Указатель",
      CLASS_RECORD: "Запись",
      CLASS_ARCHIVE: "Архив",
      CLASS_AFFILIATES: "Друзья",
      CLASS_MISSING: "Отсутствует",
      ARCHIVE_YEARS: "{n} г.",
      ARCHIVE_YEARS_ONE: "{n} г.",
      TAG_SUBJECTS: "Тем: {n}",
      TAG_SUBJECTS_ONE: "Тема: {n}",
      FONT_SAMPLE_ANTIPHON: "Лист в том виде, как его обрезали",
      FONT_SAMPLE_HUMANIST: "Более тёплая книжная гарнитура",
      FONT_SAMPLE_GROTESK: "Голос лабораторного отчёта",
      FONT_SAMPLE_MONO: "Всё есть терминал",
      LANG_AUTO_NOW: "Сейчас: {name}"
    },
    ar: {
      NAV_ARTICLES: "المقالات",
      NAV_ARCHIVE: "الأرشيف والوسوم",
      NAV_FRIENDS: "الأصدقاء",
      SEARCH: "بحث",
      SEARCH_PLACEHOLDER: "ابحث في العناوين أو الوسوم أو المقتطفات…",
      NO_RESULTS: "لا توجد نتائج",
      PINNED: "مثبّت",
      PAGE_PREV: "الصفحة السابقة",
      PAGE_NEXT: "الصفحة التالية",
      READ_TIME: "نحو {n} دقيقة",
      REVISED: "مُنقّح",
      PREV: "السابق",
      NEXT: "التالي",
      REFERENCES: "المراجع",
      INFO: "ملاحظة",
      WARNING: "تحذير",
      DANGER: "خطر",
      SUCCESS: "نجاح",
      COMMENTS: "التعليقات",
      COMMENTS_UNAVAILABLE: "لم يُضبط نظام التعليقات",
      COMMENTS_LOAD_FAILED: "تعذّر تحميل التعليقات",
      COMMENTS_PREVIEW: "التعليقات غير متاحة في المعاينة",
      LICENSE: "الترخيص",
      LICENSE_RESERVED: "جميع الحقوق محفوظة",
      LICENSE_UNLICENSED: "بلا ترخيص",
      DOWNLOAD: "تنزيل الأصل",
      COPY: "نسخ النص",
      COPY_CODE: "نسخ",
      COPIED: "تم النسخ",
      COPY_FAILED: "تعذّر النسخ",
      SHARE: "نسخ الرابط",
      LINK_COPIED: "تم نسخ الرابط",
      NOT_FOUND: "الصفحة غير موجودة",
      PASSWORD_PROMPT: "أدخل كلمة مرور المقال",
      PASSWORD_SUBMIT: "فتح",
      PASSWORD_WRONG: "كلمة مرور خاطئة",
      LIGHT_ON: "إشعال الضوء",
      LIGHT_OFF: "إطفاء الضوء",
      THEME_DAY: "نهار",
      THEME_NIGHT: "ليل",
      TOC: "المحتويات",
      BACK_TO_TOP: "إلى الأعلى",
      ANNOUNCEMENT: "إعلان الموقع",
      LOADING: "جارٍ التحميل",
      LOAD_ERROR: "تعذّر قراءة بيانات الموقع",
      LOAD_ERROR_HINT: "افتح القالب عبر معاينة BBG أو من جذر الموقع، بجوار مجلد data/.",
      MINUTES: "دقيقة",
      EMPTY: "لا شيء بعد",
      TAG_TITLE: "وسم · «{tag}»",
      CLOSE: "إغلاق",
      LANG_LABEL: "اللغة",
      LANG_AUTO: "اتباع النظام",
      FONT_LABEL: "الخط",
      NAV_LABEL: "التنقل الرئيسي",
      PAGINATION_LABEL: "ترقيم الصفحات",
      ARTICLE_NAV_LABEL: "التنقل بين المقالات",
      SKIP_TO_CONTENT: "انتقل إلى المحتوى",
      HEAD_INDEX: "المحتويات",
      HEAD_ARCHIVE: "الأرشيف",
      HEAD_TAGS: "الوسوم",
      HEAD_TOPIC: "الموضوع",
      FOOTER_CREDIT: "أُنشئ بواسطة BBG وقالب Antiphon",
      SYS_STATUS: "الرصد جارٍ",
      SYS_PROTOCOL: "البروتوكول 20261001",
      SYS_BOOT: "إقلاع النظام",
      FEATURED_FILE: "ملف مميّز",
      ACCEDE: "فتح الملف",
      SEALED: "مختوم",
      DISCUSSION_OPEN: "التعليقات مفتوحة",
      CLASSIFIED: "مصنّف",
      UNFILED: "غير مفهرس",
      STANDING_PAGE: "صفحة ثابتة",
      FILE_LABEL: "الملف",
      FILE_NO: "الملف رقم {n}",
      FILE_RECORD: "السجل {n}",
      ENTRY_NO: "رقم {n}",
      CAT_RECORDED: "تاريخ التسجيل",
      CAT_EXTENT: "الحجم",
      CAT_SECTIONS: "الأقسام",
      RUBRIC: "التصنيف",
      MARGINALIA: "هوامش",
      RECORD_NOT_FOUND: "لم يُعثر على السجل",
      RETURN_TO_INDEX: "العودة إلى الفهرس",
      SEARCH_EYEBROW: "الفهرس // الوصول",
      VISITOR: "زائر 0x{id}",
      ATOM_FEED: "تغذية Atom",
      COLOPHON: "بيان الطبعة · نهاية الملف",
      CLASS_INDEX: "الفهرس",
      CLASS_RECORD: "السجل",
      CLASS_ARCHIVE: "الأرشيف",
      CLASS_AFFILIATES: "المنتسبون",
      CLASS_MISSING: "مفقود",
      ARCHIVE_YEARS: "{n} سنوات",
      ARCHIVE_YEARS_ONE: "سنة واحدة",
      TAG_SUBJECTS: "{n} موضوعًا",
      TAG_SUBJECTS_ONE: "موضوع واحد",
      FONT_SAMPLE_ANTIPHON: "الورقة كما قُطعت",
      FONT_SAMPLE_HUMANIST: "محرف كتابي أكثر دفئًا",
      FONT_SAMPLE_GROTESK: "صوت تقرير المختبر",
      FONT_SAMPLE_MONO: "كل شيء طرفية",
      LANG_AUTO_NOW: "الحالي: {name}"
    }
  };

  /* One registry, two jobs: strings and script. `script` selects the token
     block in css/tokens.css, `htmlLang` writes html[lang] (which also drives
     the :lang() safety nets there), `dir` writes the base direction on <body>.
     `endonym` labels the entry in the masthead switcher; `code` is the short
     glyph shown inside the 2.1rem icon button. */
  var LOCALES = {
    "zh-Hans": { endonym: "简体中文", code: "简", script: "cjk", htmlLang: "zh-Hans", dir: "ltr" },
    "zh-Hant": { endonym: "繁體中文", code: "繁", script: "hant", htmlLang: "zh-Hant", dir: "ltr" },
    ja: { endonym: "日本語", code: "JA", script: "ja", htmlLang: "ja", dir: "ltr" },
    en: { endonym: "English", code: "EN", script: "latin", htmlLang: "en", dir: "ltr" },
    ko: { endonym: "한국어", code: "KO", script: "ko", htmlLang: "ko", dir: "ltr" },
    pt: { endonym: "Português", code: "PT", script: "latin", htmlLang: "pt", dir: "ltr" },
    es: { endonym: "Español", code: "ES", script: "latin", htmlLang: "es", dir: "ltr" },
    fr: { endonym: "Français", code: "FR", script: "latin", htmlLang: "fr", dir: "ltr" },
    de: { endonym: "Deutsch", code: "DE", script: "latin", htmlLang: "de", dir: "ltr" },
    ru: { endonym: "Русский", code: "RU", script: "cyrillic", htmlLang: "ru", dir: "ltr" },
    ar: { endonym: "العربية", code: "AR", script: "arabic", htmlLang: "ar", dir: "rtl" }
  };

  A.LOCALES = LOCALES;
  A.LOCALE_ORDER = ["zh-Hans", "zh-Hant", "ja", "en", "ko", "pt", "es", "fr", "de", "ru", "ar"];

  /* English is the resting language: an unplaceable system locale, a blank
     config, or a corrupt stored choice all land here rather than on Chinese.
     Falling back to Chinese would be a guess about content the visitor cannot
     read, and would leak Chinese strings into every unrelated locale. */
  var FALLBACK_TAG = "en";

  /* Backwards compatibility: BBG site configs written against the old
     name-keyed table, plus the two- and three-letter codes people type by hand.
     Keys are compared after A.normalize (lowercase, "_" -> "-"), so "zh_CN",
     "ZH-CN" and "zh-CN" all resolve the same way. */
  var ALIASES = {
    zh: "zh-Hans",
    "zh-hans": "zh-Hans",
    "zh-cn": "zh-Hans",
    "zh-sg": "zh-Hans",
    "zh-my": "zh-Hans",
    chs: "zh-Hans",
    zho: "zh-Hans",
    cmn: "zh-Hans",
    "简体中文": "zh-Hans",
    "简体": "zh-Hans",
    "中文": "zh-Hans",
    "汉语": "zh-Hans",
    chinese: "zh-Hans",
    "zh-hant": "zh-Hant",
    "zh-tw": "zh-Hant",
    "zh-hk": "zh-Hant",
    "zh-mo": "zh-Hant",
    cht: "zh-Hant",
    "繁體中文": "zh-Hant",
    "繁体中文": "zh-Hant",
    "正體中文": "zh-Hant",
    "繁體": "zh-Hant",
    ja: "ja",
    jp: "ja",
    jpn: "ja",
    japanese: "ja",
    "日本語": "ja",
    "日文": "ja",
    "日语": "ja",
    en: "en",
    eng: "en",
    english: "en",
    "英语": "en",
    "英文": "en",
    ko: "ko",
    kor: "ko",
    korean: "ko",
    "한국어": "ko",
    "韓語": "ko",
    "韩语": "ko",
    pt: "pt",
    por: "pt",
    "pt-br": "pt",
    "pt-pt": "pt",
    portuguese: "pt",
    "português": "pt",
    portugues: "pt",
    es: "es",
    spa: "es",
    spanish: "es",
    "español": "es",
    espanol: "es",
    castellano: "es",
    fr: "fr",
    fra: "fr",
    fre: "fr",
    french: "fr",
    "français": "fr",
    francais: "fr",
    de: "de",
    deu: "de",
    ger: "de",
    german: "de",
    deutsch: "de",
    ru: "ru",
    rus: "ru",
    russian: "ru",
    "русский": "ru",
    "俄语": "ru",
    "俄文": "ru",
    ar: "ar",
    ara: "ar",
    arabic: "ar",
    "العربية": "ar",
    "阿拉伯语": "ar"
  };

  /* "auto" (and the words people reach for instead) is a sentinel, not a
     language: it hands control back to navigator.languages. It is checked
     before the alias table so a future alias can never shadow it. */
  var AUTO_WORDS = {
    auto: true,
    automatic: true,
    system: true,
    default: true,
    "自动": true,
    "跟随系统": true,
    "システム": true,
    "자동": true,
    "automático": true,
    automatico: true,
    automatique: true,
    automatisch: true,
    "авто": true,
    "تلقائي": true
  };

  function has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  A.normalize = function (value) {
    return String(value == null ? "" : value)
      .trim()
      .replace(/_/g, "-")
      .toLowerCase();
  };

  A.isAuto = function (value) {
    var key = A.normalize(value);
    return key === "" || has(AUTO_WORDS, key);
  };

  /* Longest-prefix match, documented in one place because every entry point
     (config, storage, navigator) runs through it:
        pt-BR  -> pt
        es-419 -> es
        zh-HK  -> zh-Hant -> zh-Hans
        de-AT  -> de
        xx-YY  -> null  (caller substitutes en)
     Chinese gets a script decision before generic reduction, because :lang(zh)
     matches every Chinese variant and the region/subtag is what separates the
     two packs. */
  A.matchTag = function (value) {
    var tag = A.normalize(value);
    if (!tag) return null;
    if (has(ALIASES, tag)) return ALIASES[tag];
    if (has(LOCALES, tag)) return tag;
    if (tag.split("-")[0] === "zh") {
      /* zh-Hant-HK and zh-TW-Latn both carry the script or region that decides
         Traditional; a bare unsupported zh-* still reads as Simplified. */
      if (/-hant|-tw|-hk|-mo/.test(tag)) return "zh-Hant";
      return "zh-Hans";
    }
    /* Reduction must be guaranteed to shrink the tag. `-\w+$` does not match a
       subtag made of non-word characters, so a value like "zh-Hant（繁體）" or
       a corrupted stored key would strip nothing, leave the hyphen in place and
       spin this loop forever — a hard page freeze from a theme config typo.
       Splitting on the last hyphen always shortens, and the split() guard is a
       belt-and-braces stop for any tag that still fails to shrink. */
    while (tag.indexOf("-") !== -1) {
      var cut = tag.lastIndexOf("-");
      var next = tag.slice(0, cut);
      if (!next || next === tag) break;
      tag = next;
      if (has(ALIASES, tag)) return ALIASES[tag];
      if (has(LOCALES, tag)) return tag;
    }
    return null;
  };

  A.localeInfo = function (value) {
    var tag = A.matchTag(value);
    if (!tag) tag = A.lang && has(LOCALES, A.lang) ? A.lang : FALLBACK_TAG;
    return LOCALES[tag] || LOCALES[FALLBACK_TAG];
  };

  A.tagOf = function (value) {
    var tag = A.matchTag(value);
    if (tag) return tag;
    return A.lang && has(LOCALES, A.lang) ? A.lang : FALLBACK_TAG;
  };

  /* Strict resolution for any *input* a caller supplies (config value, stored
     choice, explicit argument): an unplaceable value becomes en. Unknown input
     must be deterministic, and it must never inherit whatever language happened
     to be active, which is what a lenient "keep A.lang" would do. */
  A.tagOrFallback = function (value) {
    return A.matchTag(value) || FALLBACK_TAG;
  };

  /* navigator.languages is the visitor's ordered preference; navigator.language
     is the single-valued fallback for browsers that do not ship the list. The
     first placeable entry wins — an early en-US never shadows a later pt-BR,
     which is the whole point of honouring the order. Unplaceable entries are
     skipped rather than terminating the scan. */
  A.detectSystemLocale = function () {
    var tags = [];
    try {
      if (navigator.languages && navigator.languages.length) {
        tags = Array.prototype.slice.call(navigator.languages);
      }
    } catch (error) {}
    try {
      if (navigator.language) tags.push(navigator.language);
    } catch (error) {}
    for (var i = 0; i < tags.length; i++) {
      var tag = A.matchTag(tags[i]);
      if (tag) return tag;
    }
    return null;
  };

  var LANG_KEY = "antiphon:lang";

  A.readStoredLocale = function () {
    var value = null;
    try { value = localStorage.getItem(LANG_KEY); } catch (error) {}
    return value === null || value === "" ? null : String(value);
  };

  A.storeLocale = function (value) {
    try { localStorage.setItem(LANG_KEY, String(value)); } catch (error) {}
  };

  /* Detection order, highest priority first:
       1. the visitor's stored choice (written by the masthead switcher; the
          literal "auto" clears it so the system decides again)
       2. 网站语言, when the author wrote something other than auto/blank
       3. navigator.languages, then navigator.language
       4. en
     Step 1 and 2 resolve through the alias table and the longest-prefix chain
     above. A config entry that cannot be placed at all still lands on en rather
     than falling through to the browser: an explicit-but-unknown value should
     be deterministic, not silently replaced by whatever OS the reader uses. */
  A.resolveLocale = function (configValue, storedValue) {
    var stored = storedValue === undefined ? A.readStoredLocale() : storedValue;
    if (stored !== null && stored !== "" && !A.isAuto(stored)) {
      var fromStore = A.matchTag(stored);
      if (fromStore) return fromStore;
    }
    if (!A.isAuto(configValue)) {
      return A.tagOrFallback(configValue);
    }
    return A.detectSystemLocale() || FALLBACK_TAG;
  };

  A.lang = FALLBACK_TAG;
  A.script = LOCALES[FALLBACK_TAG].script;
  A.overrides = {};

  /* Chain: overrides -> active pack -> en -> raw key. Chinese participates only
     when the active locale is Chinese: for zh-Hant the Simplified pack is the
     nearest neighbour and a genuinely useful fallback, but it must never surface
     for ar or ru, so it is gated on the script rather than used globally. */
  A.t = function (key, replace) {
    var value = A.overrides[key];
    if (value === undefined) {
      var pack = A.I18N[A.lang];
      if (pack && pack[key] !== undefined) {
        value = pack[key];
      } else {
        var info = LOCALES[A.tagOf(A.lang)] || LOCALES[FALLBACK_TAG];
        if (info.script === "hant") {
          var hans = A.I18N["zh-Hans"];
          value = hans && hans[key];
        }
      }
    }
    if (value === undefined) {
      var english = A.I18N[FALLBACK_TAG];
      value = english && english[key];
    }
    if (value === undefined) value = key;
    if (replace && typeof replace === "object") {
      Object.keys(replace).forEach(function (name) {
        value = value.replace(new RegExp("\\{" + name + "\\}", "g"), String(replace[name]));
      });
    }
    return value;
  };

  /* data-script drives the per-language token layer in css/tokens.css. It is
     the primary switch; :lang() on <html> is the CSS-level fallback. An unknown
     value resolves to en's script, never to cjk. */
  A.scriptOf = function (lang) {
    return (LOCALES[A.tagOf(lang === undefined ? A.lang : lang)] || LOCALES[FALLBACK_TAG]).script;
  };

  A.setScript = function (lang) {
    var tag = A.tagOf(lang === undefined ? A.lang : lang);
    var info = LOCALES[tag] || LOCALES[FALLBACK_TAG];
    A.script = info.script;
    try {
      var body = document.body;
      if (body) {
        body.setAttribute("data-script", info.script);
        /* RTL is declared on <body> and mirrored on <html> so the UA's own
           gutter and scrollbar decisions match. The attribute is removed for
           LTR rather than set to "ltr", keeping it out of the DOM where
           it carries no information. */
        if (info.dir === "rtl") body.setAttribute("dir", "rtl");
        else body.removeAttribute("dir");
      }
      var root = document.documentElement;
      if (root) {
        if (root.getAttribute("lang") !== info.htmlLang) root.setAttribute("lang", info.htmlLang);
        if (info.dir === "rtl") root.setAttribute("dir", "rtl");
        else root.removeAttribute("dir");
      }
    } catch (e) {}
    return info.script;
  };

  A.setLang = function (lang) {
    /* Input, not state: an argument that cannot be placed means the caller
       asked for a language we do not have, so the answer is en. Only an
       omitted argument keeps the active language. */
    A.lang = lang === undefined ? (A.lang && has(LOCALES, A.lang) ? A.lang : FALLBACK_TAG) : A.tagOrFallback(lang);
    A.setScript(A.lang);
    return A.lang;
  };

  /* Runs from a tiny head script before the stylesheets paint. There is no <body>
     yet, so html[lang] (plus dir) alone has to carry the language: the :lang()
     selectors in css/tokens.css are what pick the right token block until boot()
     re-resolves from 网站语言. Starting at en rather than zh means the
     pre-JS/pre-hydration frame never flashes Chinese at a visitor. */
  A.bootstrapLocale = function () {
    var tag = A.resolveLocale(null, A.readStoredLocale());
    A.lang = tag;
    A.script = LOCALES[tag].script;
    try {
      var root = document.documentElement;
      root.setAttribute("lang", LOCALES[tag].htmlLang);
      if (LOCALES[tag].dir === "rtl") root.setAttribute("dir", "rtl");
      else root.removeAttribute("dir");
    } catch (e) {}
    return tag;
  };

  A.applyInterfaceText = function (blog) {
    A.overrides = {};
    try {
      var cfg = blog && blog["自定义界面文本"];
      if (!cfg || cfg["启用"] !== true) return;
      var list = cfg["列表"] || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i] && typeof list[i].key === "string") {
          A.overrides[list[i].key] = String(list[i].value == null ? "" : list[i].value);
        }
      }
    } catch (e) {}
  };

  /* index.html ships neutral English placeholder copy so the static shell reads
     correctly without JS, and stays language-agnostic rather than shipping
     Chinese to every visitor. Once a locale is resolved those attributes are
     rewritten from the active pack; this runs before the first view paints. */
  A.applyDomText = function () {
    function fill() {
      var input = document.getElementById("search-input");
      if (input) input.setAttribute("placeholder", A.t("SEARCH_PLACEHOLDER"));
      var searchTitle = document.getElementById("search-title");
      if (searchTitle) searchTitle.textContent = A.t("SEARCH");
      var eyebrow = document.getElementById("search-eyebrow");
      if (eyebrow) eyebrow.textContent = A.t("SEARCH_EYEBROW");
      var boot = document.querySelector("#loading p");
      if (boot) boot.textContent = A.t("SYS_BOOT");
      ["search-close", "viewer-close"].forEach(function (id) {
        var node = document.getElementById(id);
        if (node) node.setAttribute("aria-label", A.t("CLOSE"));
      });
      var top = document.getElementById("back-to-top");
      if (top) top.setAttribute("aria-label", A.t("BACK_TO_TOP"));
      var skip = document.querySelector(".skip");
      if (skip) skip.textContent = A.t("SKIP_TO_CONTENT");
      var searchLabel = document.querySelector(".overlay-close");
      if (searchLabel && !searchLabel.getAttribute("aria-label")) {
        searchLabel.setAttribute("aria-label", A.t("CLOSE"));
      }
      /* The static <title> is the brand name, not a translated string, but a
         visitor who lands on the bare shell before the first route resolves
         should still see the site's own title rather than a placeholder. */
      var blog = A.state && A.state.blog;
      if (blog) {
        var name = A.state.blog["博客标题"] || "Antiphon";
        if (document.title === "Antiphon" || document.title === "对经") {
          document.title = String(name);
        }
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fill);
    } else {
      fill();
    }
  };

})(window.Antiphon);
