// ===== 五十音全量 + 手写默写练习（86 机械感） =====
// 数据：清音 46 + 浊音 20 + 半浊音 5 + 拗音 33 = 104 个假名
// 功能：分类 tab 浏览（点击朗读/查看详情/清音支持掌握标记）+ 手写练习（临摹/假名默写/单词默写）
// 判分：优先 navigator.handwriting（Chrome on-device），不可用降级「对照自评」
// 兼容：app.js 直接调用 renderKana()；后端不可用时降级为纯本地展示

const KANA_CATS = [
  { id: 'seion', label: '清音', sub: 'SEION' },
  { id: 'dakuon', label: '浊音', sub: 'DAKUON' },
  { id: 'handakuon', label: '半浊音', sub: 'HANDAKUON' },
  { id: 'youon', label: '拗音', sub: 'YOUON' },
];
const KANA_CAT_MAP = Object.fromEntries(KANA_CATS.map((c) => [c.id, c]));

// 字段：h 平假名 / k 片假名 / r 罗马音 / cat 分类 / sc 笔画数 / ex 示例词(假名) / ej 示例词(汉字,可空) / ec 示例词(中文)
const KANA_DATA = [
  // ===== 清音 46 =====
  { h: 'あ', k: 'ア', r: 'a', cat: 'seion', sc: 3, ex: 'あめ', ej: '雨', ec: '雨' },
  { h: 'い', k: 'イ', r: 'i', cat: 'seion', sc: 2, ex: 'いぬ', ej: '犬', ec: '狗' },
  { h: 'う', k: 'ウ', r: 'u', cat: 'seion', sc: 2, ex: 'うみ', ej: '海', ec: '海' },
  { h: 'え', k: 'エ', r: 'e', cat: 'seion', sc: 2, ex: 'えき', ej: '駅', ec: '车站' },
  { h: 'お', k: 'オ', r: 'o', cat: 'seion', sc: 3, ex: 'おかね', ej: 'お金', ec: '钱' },
  { h: 'か', k: 'カ', r: 'ka', cat: 'seion', sc: 3, ex: 'かさ', ej: '傘', ec: '伞' },
  { h: 'き', k: 'キ', r: 'ki', cat: 'seion', sc: 4, ex: 'きく', ej: '菊', ec: '菊花' },
  { h: 'く', k: 'ク', r: 'ku', cat: 'seion', sc: 1, ex: 'くつ', ej: '靴', ec: '鞋' },
  { h: 'け', k: 'ケ', r: 'ke', cat: 'seion', sc: 3, ex: 'けしき', ej: '景色', ec: '风景' },
  { h: 'こ', k: 'コ', r: 'ko', cat: 'seion', sc: 2, ex: 'こえ', ej: '声', ec: '声音' },
  { h: 'さ', k: 'サ', r: 'sa', cat: 'seion', sc: 3, ex: 'さかな', ej: '魚', ec: '鱼' },
  { h: 'し', k: 'シ', r: 'shi', cat: 'seion', sc: 3, ex: 'しま', ej: '島', ec: '岛' },
  { h: 'す', k: 'ス', r: 'su', cat: 'seion', sc: 2, ex: 'すし', ej: '寿司', ec: '寿司' },
  { h: 'せ', k: 'セ', r: 'se', cat: 'seion', sc: 3, ex: 'せかい', ej: '世界', ec: '世界' },
  { h: 'そ', k: 'ソ', r: 'so', cat: 'seion', sc: 2, ex: 'そら', ej: '空', ec: '天空' },
  { h: 'た', k: 'タ', r: 'ta', cat: 'seion', sc: 4, ex: 'たまご', ej: '卵', ec: '鸡蛋' },
  { h: 'ち', k: 'チ', r: 'chi', cat: 'seion', sc: 3, ex: 'ちず', ej: '地図', ec: '地图' },
  { h: 'つ', k: 'ツ', r: 'tsu', cat: 'seion', sc: 1, ex: 'つき', ej: '月', ec: '月亮' },
  { h: 'て', k: 'テ', r: 'te', cat: 'seion', sc: 3, ex: 'て', ej: '手', ec: '手' },
  { h: 'と', k: 'ト', r: 'to', cat: 'seion', sc: 2, ex: 'とき', ej: '時', ec: '时间' },
  { h: 'な', k: 'ナ', r: 'na', cat: 'seion', sc: 4, ex: 'なつ', ej: '夏', ec: '夏天' },
  { h: 'に', k: 'ニ', r: 'ni', cat: 'seion', sc: 3, ex: 'にく', ej: '肉', ec: '肉' },
  { h: 'ぬ', k: 'ヌ', r: 'nu', cat: 'seion', sc: 2, ex: 'ぬの', ej: '布', ec: '布' },
  { h: 'ね', k: 'ネ', r: 'ne', cat: 'seion', sc: 4, ex: 'ねこ', ej: '猫', ec: '猫' },
  { h: 'の', k: 'ノ', r: 'no', cat: 'seion', sc: 1, ex: 'のり', ej: '海苔', ec: '海苔' },
  { h: 'は', k: 'ハ', r: 'ha', cat: 'seion', sc: 3, ex: 'はな', ej: '花', ec: '花' },
  { h: 'ひ', k: 'ヒ', r: 'hi', cat: 'seion', sc: 2, ex: 'ひと', ej: '人', ec: '人' },
  { h: 'ふ', k: 'フ', r: 'fu', cat: 'seion', sc: 1, ex: 'ふね', ej: '船', ec: '船' },
  { h: 'へ', k: 'ヘ', r: 'he', cat: 'seion', sc: 1, ex: 'へや', ej: '部屋', ec: '房间' },
  { h: 'ほ', k: 'ホ', r: 'ho', cat: 'seion', sc: 4, ex: 'ほし', ej: '星', ec: '星星' },
  { h: 'ま', k: 'マ', r: 'ma', cat: 'seion', sc: 3, ex: 'まど', ej: '窓', ec: '窗户' },
  { h: 'み', k: 'ミ', r: 'mi', cat: 'seion', sc: 3, ex: 'みず', ej: '水', ec: '水' },
  { h: 'む', k: 'ム', r: 'mu', cat: 'seion', sc: 3, ex: 'むら', ej: '村', ec: '村子' },
  { h: 'め', k: 'メ', r: 'me', cat: 'seion', sc: 2, ex: 'め', ej: '目', ec: '眼睛' },
  { h: 'も', k: 'モ', r: 'mo', cat: 'seion', sc: 3, ex: 'もり', ej: '森', ec: '森林' },
  { h: 'や', k: 'ヤ', r: 'ya', cat: 'seion', sc: 3, ex: 'やま', ej: '山', ec: '山' },
  { h: 'ゆ', k: 'ユ', r: 'yu', cat: 'seion', sc: 2, ex: 'ゆき', ej: '雪', ec: '雪' },
  { h: 'よ', k: 'ヨ', r: 'yo', cat: 'seion', sc: 3, ex: 'よる', ej: '夜', ec: '夜晚' },
  { h: 'ら', k: 'ラ', r: 'ra', cat: 'seion', sc: 2, ex: 'らくだ', ej: '駱駝', ec: '骆驼' },
  { h: 'り', k: 'リ', r: 'ri', cat: 'seion', sc: 2, ex: 'りんご', ej: '林檎', ec: '苹果' },
  { h: 'る', k: 'ル', r: 'ru', cat: 'seion', sc: 1, ex: 'るす', ej: '留守', ec: '不在家' },
  { h: 'れ', k: 'レ', r: 're', cat: 'seion', sc: 2, ex: 'れきし', ej: '歴史', ec: '历史' },
  { h: 'ろ', k: 'ロ', r: 'ro', cat: 'seion', sc: 2, ex: 'ろく', ej: '六', ec: '六' },
  { h: 'わ', k: 'ワ', r: 'wa', cat: 'seion', sc: 2, ex: 'わたし', ej: '私', ec: '我' },
  { h: 'を', k: 'ヲ', r: 'wo', cat: 'seion', sc: 3, ex: 'を', ej: 'を', ec: '助词' },
  { h: 'ん', k: 'ン', r: 'n', cat: 'seion', sc: 1, ex: 'さん', ej: '三', ec: '三' },
  // ===== 浊音 20 =====
  { h: 'が', k: 'ガ', r: 'ga', cat: 'dakuon', sc: 3, ex: 'がっこう', ej: '学校', ec: '学校' },
  { h: 'ぎ', k: 'ギ', r: 'gi', cat: 'dakuon', sc: 4, ex: 'ぎんこう', ej: '銀行', ec: '银行' },
  { h: 'ぐ', k: 'グ', r: 'gu', cat: 'dakuon', sc: 1, ex: 'ぐうぜん', ej: '偶然', ec: '偶然' },
  { h: 'げ', k: 'ゲ', r: 'ge', cat: 'dakuon', sc: 3, ex: 'げんき', ej: '元気', ec: '精神' },
  { h: 'ご', k: 'ゴ', r: 'go', cat: 'dakuon', sc: 2, ex: 'ごご', ej: '午後', ec: '下午' },
  { h: 'ざ', k: 'ザ', r: 'za', cat: 'dakuon', sc: 3, ex: 'ざっし', ej: '雑誌', ec: '杂志' },
  { h: 'じ', k: 'ジ', r: 'ji', cat: 'dakuon', sc: 3, ex: 'じかん', ej: '時間', ec: '时间' },
  { h: 'ず', k: 'ズ', r: 'zu', cat: 'dakuon', sc: 2, ex: 'ずかん', ej: '図鑑', ec: '图鉴' },
  { h: 'ぜ', k: 'ゼ', r: 'ze', cat: 'dakuon', sc: 3, ex: 'ぜんぶ', ej: '全部', ec: '全部' },
  { h: 'ぞ', k: 'ゾ', r: 'zo', cat: 'dakuon', sc: 2, ex: 'ぞう', ej: '象', ec: '大象' },
  { h: 'だ', k: 'ダ', r: 'da', cat: 'dakuon', sc: 4, ex: 'だいがく', ej: '大学', ec: '大学' },
  { h: 'ぢ', k: 'ヂ', r: 'ji', cat: 'dakuon', sc: 3, ex: 'はなぢ', ej: '鼻血', ec: '鼻血' },
  { h: 'づ', k: 'ヅ', r: 'zu', cat: 'dakuon', sc: 1, ex: 'つづく', ej: '続く', ec: '继续' },
  { h: 'で', k: 'デ', r: 'de', cat: 'dakuon', sc: 3, ex: 'でんわ', ej: '電話', ec: '电话' },
  { h: 'ど', k: 'ド', r: 'do', cat: 'dakuon', sc: 2, ex: 'どうぶつ', ej: '動物', ec: '动物' },
  { h: 'ば', k: 'バ', r: 'ba', cat: 'dakuon', sc: 3, ex: 'ばんごう', ej: '番号', ec: '号码' },
  { h: 'び', k: 'ビ', r: 'bi', cat: 'dakuon', sc: 4, ex: 'びょういん', ej: '病院', ec: '医院' },
  { h: 'ぶ', k: 'ブ', r: 'bu', cat: 'dakuon', sc: 3, ex: 'ぶんか', ej: '文化', ec: '文化' },
  { h: 'べ', k: 'ベ', r: 'be', cat: 'dakuon', sc: 3, ex: 'べんきょう', ej: '勉強', ec: '学习' },
  { h: 'ぼ', k: 'ボ', r: 'bo', cat: 'dakuon', sc: 4, ex: 'ぼうし', ej: '帽子', ec: '帽子' },
  // ===== 半浊音 5 =====
  { h: 'ぱ', k: 'パ', r: 'pa', cat: 'handakuon', sc: 3, ex: 'ぱん', ej: 'パン', ec: '面包' },
  { h: 'ぴ', k: 'ピ', r: 'pi', cat: 'handakuon', sc: 4, ex: 'ぴあの', ej: 'ピアノ', ec: '钢琴' },
  { h: 'ぷ', k: 'プ', r: 'pu', cat: 'handakuon', sc: 3, ex: 'ぷれぜんと', ej: 'プレゼント', ec: '礼物' },
  { h: 'ぺ', k: 'ペ', r: 'pe', cat: 'handakuon', sc: 3, ex: 'ぺん', ej: 'ペン', ec: '笔' },
  { h: 'ぽ', k: 'ポ', r: 'po', cat: 'handakuon', sc: 4, ex: 'ぽけっと', ej: 'ポケット', ec: '口袋' },
  // ===== 拗音 33 =====
  { h: 'きゃ', k: 'キャ', r: 'kya', cat: 'youon', sc: 4, ex: 'きゃく', ej: '客', ec: '客人' },
  { h: 'きゅ', k: 'キュ', r: 'kyu', cat: 'youon', sc: 3, ex: 'きゅうり', ej: '胡瓜', ec: '黄瓜' },
  { h: 'きょ', k: 'キョ', r: 'kyo', cat: 'youon', sc: 4, ex: 'きょう', ej: '今日', ec: '今天' },
  { h: 'しゃ', k: 'シャ', r: 'sha', cat: 'youon', sc: 4, ex: 'しゃしん', ej: '写真', ec: '照片' },
  { h: 'しゅ', k: 'シュ', r: 'shu', cat: 'youon', sc: 3, ex: 'しゅくだい', ej: '宿題', ec: '作业' },
  { h: 'しょ', k: 'ショ', r: 'sho', cat: 'youon', sc: 4, ex: 'しょくどう', ej: '食堂', ec: '食堂' },
  { h: 'ちゃ', k: 'チャ', r: 'cha', cat: 'youon', sc: 4, ex: 'ちゃ', ej: '茶', ec: '茶' },
  { h: 'ちゅ', k: 'チュ', r: 'chu', cat: 'youon', sc: 3, ex: 'ちゅうがっこう', ej: '中学校', ec: '初中' },
  { h: 'ちょ', k: 'チョ', r: 'cho', cat: 'youon', sc: 4, ex: 'ちょっと', ej: 'ちょっと', ec: '稍微' },
  { h: 'にゃ', k: 'ニャ', r: 'nya', cat: 'youon', sc: 3, ex: 'こんにゃく', ej: '蒟蒻', ec: '魔芋' },
  { h: 'にゅ', k: 'ニュ', r: 'nyu', cat: 'youon', sc: 2, ex: 'にゅうがく', ej: '入学', ec: '入学' },
  { h: 'にょ', k: 'ニョ', r: 'nyo', cat: 'youon', sc: 3, ex: 'にょきにょき', ej: 'にょきにょき', ec: '拟声词' },
  { h: 'ひゃ', k: 'ヒャ', r: 'hya', cat: 'youon', sc: 3, ex: 'ひゃく', ej: '百', ec: '一百' },
  { h: 'ひゅ', k: 'ヒュ', r: 'hyu', cat: 'youon', sc: 2, ex: 'ひゅう', ej: 'ひゅう', ec: '拟声词' },
  { h: 'ひょ', k: 'ヒョ', r: 'hyo', cat: 'youon', sc: 3, ex: 'ひょう', ej: '表', ec: '表格' },
  { h: 'みゃ', k: 'ミャ', r: 'mya', cat: 'youon', sc: 4, ex: 'みゃく', ej: '脈', ec: '脉搏' },
  { h: 'みゅ', k: 'ミュ', r: 'myu', cat: 'youon', sc: 3, ex: 'みゅーじっく', ej: 'ミュージック', ec: '音乐' },
  { h: 'みょ', k: 'ミョ', r: 'myo', cat: 'youon', sc: 4, ex: 'みょうじ', ej: '名字', ec: '姓氏' },
  { h: 'りゃ', k: 'リャ', r: 'rya', cat: 'youon', sc: 3, ex: 'りゃくご', ej: '略語', ec: '略语' },
  { h: 'りゅ', k: 'リュ', r: 'ryu', cat: 'youon', sc: 2, ex: 'りゅうがく', ej: '留学', ec: '留学' },
  { h: 'りょ', k: 'リョ', r: 'ryo', cat: 'youon', sc: 3, ex: 'りょこう', ej: '旅行', ec: '旅行' },
  { h: 'ぎゃ', k: 'ギャ', r: 'gya', cat: 'youon', sc: 4, ex: 'ぎゃく', ej: '逆', ec: '相反' },
  { h: 'ぎゅ', k: 'ギュ', r: 'gyu', cat: 'youon', sc: 3, ex: 'ぎゅうにく', ej: '牛肉', ec: '牛肉' },
  { h: 'ぎょ', k: 'ギョ', r: 'gyo', cat: 'youon', sc: 4, ex: 'ぎょぎょう', ej: '漁業', ec: '渔业' },
  { h: 'じゃ', k: 'ジャ', r: 'ja', cat: 'youon', sc: 4, ex: 'じゃがいも', ej: 'じゃがいも', ec: '土豆' },
  { h: 'じゅ', k: 'ジュ', r: 'ju', cat: 'youon', sc: 3, ex: 'じゅぎょう', ej: '授業', ec: '课程' },
  { h: 'じょ', k: 'ジョ', r: 'jo', cat: 'youon', sc: 4, ex: 'じょし', ej: '女子', ec: '女生' },
  { h: 'びゃ', k: 'ビャ', r: 'bya', cat: 'youon', sc: 4, ex: 'さんびゃく', ej: '三百', ec: '三百' },
  { h: 'びゅ', k: 'ビュ', r: 'byu', cat: 'youon', sc: 3, ex: 'びゅう', ej: 'びゅう', ec: '拟声词' },
  { h: 'びょ', k: 'ビョ', r: 'byo', cat: 'youon', sc: 4, ex: 'びょうき', ej: '病気', ec: '疾病' },
  { h: 'ぴゃ', k: 'ピャ', r: 'pya', cat: 'youon', sc: 4, ex: 'ぴゃっと', ej: 'ぴゃっと', ec: '拟声词' },
  { h: 'ぴゅ', k: 'ピュ', r: 'pyu', cat: 'youon', sc: 3, ex: 'ぴゅー', ej: 'ぴゅー', ec: '拟声词' },
  { h: 'ぴょ', k: 'ピョ', r: 'pyo', cat: 'youon', sc: 4, ex: 'ぴょんぴょん', ej: 'ぴょんぴょん', ec: '蹦蹦跳跳' },
];

// ===== 内置 N5 单词表（假名 + 中文释义，单词默写用） =====
const WRITE_WORDS = [
  { kana: 'わたし', kanji: '私', cn: '我' },
  { kana: 'がくせい', kanji: '学生', cn: '学生' },
  { kana: 'せんせい', kanji: '先生', cn: '老师' },
  { kana: 'ともだち', kanji: '友達', cn: '朋友' },
  { kana: 'かぞく', kanji: '家族', cn: '家人' },
  { kana: 'はは', kanji: '母', cn: '母亲' },
  { kana: 'ちち', kanji: '父', cn: '父亲' },
  { kana: 'あね', kanji: '姉', cn: '姐姐' },
  { kana: 'あに', kanji: '兄', cn: '哥哥' },
  { kana: 'いもうと', kanji: '妹', cn: '妹妹' },
  { kana: 'おとうと', kanji: '弟', cn: '弟弟' },
  { kana: 'いえ', kanji: '家', cn: '家' },
  { kana: 'くるま', kanji: '車', cn: '车' },
  { kana: 'でんしゃ', kanji: '電車', cn: '电车' },
  { kana: 'じてんしゃ', kanji: '自転車', cn: '自行车' },
  { kana: 'ほん', kanji: '本', cn: '书' },
  { kana: 'えんぴつ', kanji: '鉛筆', cn: '铅笔' },
  { kana: 'とけい', kanji: '時計', cn: '钟表' },
  { kana: 'かばん', kanji: '鞄', cn: '包' },
  { kana: 'くつ', kanji: '靴', cn: '鞋' },
  { kana: 'みず', kanji: '水', cn: '水' },
  { kana: 'たべもの', kanji: '食べ物', cn: '食物' },
  { kana: 'のみもの', kanji: '飲み物', cn: '饮料' },
  { kana: 'くだもの', kanji: '果物', cn: '水果' },
  { kana: 'やさい', kanji: '野菜', cn: '蔬菜' },
  { kana: 'にく', kanji: '肉', cn: '肉' },
  { kana: 'さかな', kanji: '魚', cn: '鱼' },
  { kana: 'ごはん', kanji: 'ご飯', cn: '米饭' },
  { kana: 'あさごはん', kanji: '朝ご飯', cn: '早餐' },
  { kana: 'ひるごはん', kanji: '昼ご飯', cn: '午餐' },
  { kana: 'ばんごはん', kanji: '晩ご飯', cn: '晚餐' },
  { kana: 'がっこう', kanji: '学校', cn: '学校' },
  { kana: 'きょうしつ', kanji: '教室', cn: '教室' },
  { kana: 'としょかん', kanji: '図書館', cn: '图书馆' },
  { kana: 'びょういん', kanji: '病院', cn: '医院' },
  { kana: 'こうえん', kanji: '公園', cn: '公园' },
  { kana: 'えいが', kanji: '映画', cn: '电影' },
  { kana: 'おんがく', kanji: '音楽', cn: '音乐' },
  { kana: 'てんき', kanji: '天気', cn: '天气' },
  { kana: 'きょう', kanji: '今日', cn: '今天' },
];

// ===== 状态 =====
let kanaCat = 'seion';        // 当前分类 tab
let kanaMastered = [];        // 已掌握假名（后端数据，仅清音可用）
let kanaSelected = null;      // 当前选中的假名（详情面板）
let writeMode = 'trace';      // trace | kana | word
let writePool = 'cat';        // cat=当前分类 | all=全部
let writeStats = { correct: 0, total: 0 };
let writeCurrent = null;      // 当前题目
let writeStrokes = [];        // 手写笔画 [{id,color,width,points:[{x,y,t}]}]
let writeColor = '#f2f4f8';   // 笔迹颜色
let writeWidth = 6;           // 笔迹粗细
let writeDrawing = false;     // 是否正在绘制
let writeStrokeId = 0;

// ===== 工具函数 =====
function kanaOfCat(cat) {
  return KANA_DATA.filter((k) => k.cat === cat);
}

function randOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.4;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch (e) { /* 静默降级 */ }
}

// 平假名 -> 片假名（用于归一化比较）
function toKatakana(s) {
  return String(s || '').replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}
// 答案归一化：去除空白/分隔符，统一片假名
function normAnswer(s) {
  return toKatakana(s).replace(/[\s\-・、。.!！?？]/g, '');
}

// ===== 后端掌握进度（失败静默降级） =====
async function loadKanaProgress() {
  try {
    const list = await api('/kana/progress');
    kanaMastered = Array.isArray(list) ? list : [];
  } catch (e) {
    kanaMastered = [];
  }
}

// ===== 主渲染（app.js 调用入口） =====
async function renderKana() {
  const el = document.getElementById('kana');
  el.innerHTML = `
    <h2>五十音 <small style="font-size:12px;color:var(--ink-2);letter-spacing:.2em;">KANA · 全量</small></h2>
    <div id="kanaBrowser"></div>
    <div id="writePanel"></div>
  `;
  await loadKanaProgress();
  renderKanaBrowser();
  renderWritePanel();
}

// ===== 一、假名浏览（分类 tab + 卡片网格） =====
function renderKanaBrowser() {
  const wrap = document.getElementById('kanaBrowser');
  if (!wrap) return;

  const list = kanaOfCat(kanaCat);
  const cat = KANA_CAT_MAP[kanaCat];

  wrap.innerHTML = `
    <div class="kana-cat-bar">
      <div class="seg kana-cat-seg">
        ${KANA_CATS.map((c) => `
          <button data-cat="${c.id}" class="${kanaCat === c.id ? 'active' : ''}" title="${c.sub}">
            ${c.label}<span class="kana-cat-count">${kanaOfCat(c.id).length}</span>
          </button>`).join('')}
      </div>
      <span class="card-note">共 ${list.length} 个假名 · 点击卡片听读音，清音可标记掌握</span>
    </div>
    <div class="kana-card-grid">
      ${list.map((k) => {
        const done = k.cat === 'seion' && kanaMastered.includes(k.h);
        const sel = kanaSelected && kanaSelected.h === k.h;
        return `
          <div class="kana-card ${done ? 'done' : ''} ${sel ? 'sel' : ''}" data-h="${k.h}">
            <div class="kana-card-jp">${k.h}</div>
            <div class="kana-card-kk">${k.k}</div>
            <div class="kana-card-rm">${k.r}</div>
            <div class="kana-card-ex">${k.ex}${k.ej && k.ej !== k.ex ? '·' + k.ej : ''}</div>
            ${k.cat === 'seion' && done ? '<span class="kana-card-mastered">●</span>' : ''}
          </div>`;
      }).join('')}
    </div>
    <div class="kana-card-detail hidden" id="kanaCardDetail"></div>
  `;

  // tab 切换
  wrap.querySelectorAll('.kana-cat-seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      kanaCat = btn.dataset.cat;
      kanaSelected = null;
      renderKanaBrowser();
    });
  });

  // 卡片点击：详情 + 朗读
  const detail = wrap.querySelector('#kanaCardDetail');
  wrap.querySelectorAll('.kana-card[data-h]').forEach((card) => {
    card.addEventListener('click', () => {
      const k = KANA_DATA.find((x) => x.h === card.dataset.h);
      if (!k) return;
      kanaSelected = k;
      wrap.querySelectorAll('.kana-card').forEach((c) => c.classList.remove('sel'));
      card.classList.add('sel');
      speak(k.h + '、' + k.ex);

      const done = k.cat === 'seion' && kanaMastered.includes(k.h);
      detail.classList.remove('hidden');
      detail.innerHTML = `
        <div class="kcd-big">
          <span class="kcd-hira">${k.h}</span>
          <span class="kcd-kata">${k.k}</span>
        </div>
        <div class="kcd-info">
          <div class="kcd-roma">${k.r}</div>
          <div class="kcd-meta">${KANA_CAT_MAP[k.cat].label} · ${k.sc} 画</div>
          <div class="kcd-ex">${k.ex}${k.ej && k.ej !== k.ex ? '（' + k.ej + '）' : ''} — ${k.ec}</div>
        </div>
        <div class="kcd-actions">
          <button class="btn-primary kcd-sound">朗读</button>
          ${k.cat === 'seion'
            ? `<button class="btn-ghost kcd-master">${done ? '取消掌握' : '标记掌握'}</button>`
            : ''}
          <div class="kcd-msg"></div>
        </div>
      `;

      detail.querySelector('.kcd-sound').addEventListener('click', () => speak(k.h + '、' + k.ex));

      const masterBtn = detail.querySelector('.kcd-master');
      if (masterBtn) {
        masterBtn.addEventListener('click', async () => {
          const wasDone = kanaMastered.includes(k.h);
          const msg = detail.querySelector('.kcd-msg');
          masterBtn.disabled = true;
          try {
            await api('/kana/progress', {
              method: 'POST',
              body: JSON.stringify({ hiragana: k.h, mastered: !wasDone }),
            });
            if (wasDone) kanaMastered = kanaMastered.filter((x) => x !== k.h);
            else kanaMastered.push(k.h);
            renderKanaBrowser();
          } catch (e) {
            masterBtn.disabled = false;
            if (msg) msg.textContent = '保存失败：' + e.message;
          }
        });
      }
    });
  });
}

// ===== 二、手写练习 =====
function renderWritePanel() {
  const wrap = document.getElementById('writePanel');
  if (!wrap) return;

  const autoMode = 'handwriting' in navigator && !!navigator.handwriting;

  wrap.innerHTML = `
    <div class="write-panel scanline">
      <div class="write-head">
        <h3 class="card-title">手写练习 <small>HANDWRITING DRILL</small></h3>
        <span class="write-mode-badge ${autoMode ? 'auto' : 'self'}">识别模式：${autoMode ? '自动识别' : '对照自评'}</span>
      </div>

      <div class="write-controls">
        <div class="seg write-mode-seg">
          <button data-mode="trace" class="${writeMode === 'trace' ? 'active' : ''}">临摹</button>
          <button data-mode="kana" class="${writeMode === 'kana' ? 'active' : ''}">假名默写</button>
          <button data-mode="word" class="${writeMode === 'word' ? 'active' : ''}">单词默写</button>
        </div>
        <div class="seg write-pool-seg">
          <button data-pool="cat" class="${writePool === 'cat' ? 'active' : ''}">当前分类</button>
          <button data-pool="all" class="${writePool === 'all' ? 'active' : ''}">全部</button>
        </div>
      </div>

      <div class="write-body">
        <div class="write-prompt">
          <div class="write-prompt-label">出题面板</div>
          <div id="writeTarget" class="write-target"></div>
          <div id="writeQuestion" class="write-question"></div>
          <button class="btn-ghost write-sound hidden" id="writeSoundBtn">播放读音</button>
        </div>
        <div class="write-board">
          <div class="write-board-head">
            <span>书写区</span>
            <div class="write-tools">
              <div class="write-colors" id="writeColors">
                ${['#f2f4f8', '#ff6a3d', '#4c7a5a', '#ffb36b'].map((c) =>
                  `<button class="write-color ${writeColor === c ? 'active' : ''}" data-color="${c}" style="--sw:${c}" title="${c}"></button>`
                ).join('')}
              </div>
              <div class="write-sizes">
                ${[3, 6, 10].map((s) =>
                  `<button class="write-size ${writeWidth === s ? 'active' : ''}" data-size="${s}">${s}</button>`
                ).join('')}
              </div>
              <button class="btn-ghost write-tool-btn" id="writeUndo">撤销</button>
              <button class="btn-ghost write-tool-btn" id="writeClear">清除</button>
            </div>
          </div>
          <canvas class="write-canvas" id="writeCanvas"></canvas>
          <div class="write-actions">
            <button class="btn-primary" id="writeSubmit">提交判分</button>
            <button class="btn-ghost" id="writeNext">下一题</button>
            <button class="btn-ghost" id="writeReset">重置统计</button>
          </div>
          <div class="write-feedback" id="writeFeedback"></div>
        </div>
      </div>

      <div class="write-stats">
        <div class="write-stat">
          <div class="write-stat-num" id="statCorrect">${writeStats.correct}</div>
          <div class="write-stat-label">CORRECT 正确</div>
        </div>
        <div class="write-stat">
          <div class="write-stat-num" id="statTotal">${writeStats.total}</div>
          <div class="write-stat-label">TOTAL 总数</div>
        </div>
        <div class="write-stat">
          <div class="write-stat-num" id="statRate">${writeStats.total ? Math.round((writeStats.correct / writeStats.total) * 100) : 0}%</div>
          <div class="write-stat-label">ACCURACY 正确率</div>
        </div>
        <div class="write-stat write-stat-bar">
          <div class="bar"><span id="statBar" style="width:${writeStats.total ? Math.round((writeStats.correct / writeStats.total) * 100) : 0}%"></span></div>
          <div class="write-stat-label">PROGRESS 进度</div>
        </div>
      </div>
    </div>
  `;

  // 模式 / 题库切换
  wrap.querySelectorAll('.write-mode-seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      writeMode = btn.dataset.mode;
      writeCurrent = null;
      writeStrokes = [];
      renderWritePanel();
    });
  });
  wrap.querySelectorAll('.write-pool-seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      writePool = btn.dataset.pool;
      writeCurrent = null;
      writeStrokes = [];
      renderWritePanel();
    });
  });

  initWriteBoard(wrap);
  nextWriteQuestion(wrap);
}

// 获取当前题库（假名题）
function writeKanaPool() {
  return writePool === 'all' ? KANA_DATA.slice() : kanaOfCat(kanaCat);
}

// 下一题
function nextWriteQuestion(wrap) {
  if (!wrap) wrap = document.getElementById('writePanel');
  if (!wrap) return;
  writeCurrent = null;
  writeStrokes = [];
  writeStrokeId = 0;

  if (writeMode === 'word') {
    const w = randOf(WRITE_WORDS);
    writeCurrent = { type: 'word', kana: w.kana, kanji: w.kanji, cn: w.cn };
  } else if (writeMode === 'kana') {
    const pool = writeKanaPool();
    const k = randOf(pool);
    writeCurrent = { type: 'kana', h: k.h, k: k.k, r: k.r, ex: k.ex, ej: k.ej, ec: k.ec, cat: k.cat };
  } else {
    const pool = writeKanaPool();
    const k = randOf(pool);
    writeCurrent = { type: 'trace', h: k.h, k: k.k, r: k.r, ex: k.ex, ej: k.ej, ec: k.ec, sc: k.sc, cat: k.cat };
  }

  // 出题面板
  const t = wrap.querySelector('#writeTarget');
  const q = wrap.querySelector('#writeQuestion');
  const snd = wrap.querySelector('#writeSoundBtn');
  const fb = wrap.querySelector('#writeFeedback');
  if (fb) { fb.className = 'write-feedback'; fb.textContent = ''; }

  if (writeCurrent.type === 'trace') {
    t.innerHTML = `<div class="wt-big">${writeCurrent.h}</div><div class="wt-kata">${writeCurrent.k}</div>`;
    q.innerHTML = `
      <div class="wq-line">罗马音 <b>${writeCurrent.r}</b> · ${KANA_CAT_MAP[writeCurrent.cat].label} · ${writeCurrent.sc} 画</div>
      <div class="wq-line sub">${writeCurrent.ex}${writeCurrent.ej && writeCurrent.ej !== writeCurrent.ex ? '（' + writeCurrent.ej + '）' : ''} — ${writeCurrent.ec}</div>
      <div class="wq-tip">照虚线底稿跟写，练完点「提交判分」换下一题</div>`;
    snd.classList.remove('hidden');
  } else if (writeCurrent.type === 'kana') {
    t.innerHTML = `<div class="wt-roma">${writeCurrent.r}</div>`;
    q.innerHTML = `
      <div class="wq-line">请手写罗马音 <b>${writeCurrent.r}</b> 对应的假名</div>
      <div class="wq-line sub">提示：${writeCurrent.ex}${writeCurrent.ej && writeCurrent.ej !== writeCurrent.ex ? '（' + writeCurrent.ej + '）' : ''} — ${writeCurrent.ec}</div>`;
    snd.classList.remove('hidden');
  } else {
    t.innerHTML = `<div class="wt-word">${writeCurrent.kanji}</div>`;
    q.innerHTML = `
      <div class="wq-line">释义：<b>${writeCurrent.cn}</b></div>
      <div class="wq-line sub">${writeCurrent.kanji === writeCurrent.kana ? '' : '请写出「' + writeCurrent.kanji + '」的假名（平/片假名均可）'}</div>`;
    snd.classList.add('hidden');
  }

  if (snd) snd.onclick = () => speak(writeCurrent.type === 'word' ? writeCurrent.kana : (writeCurrent.h || writeCurrent.r));

  // 重绘画布（临摹模式画底稿）
  drawWriteCanvas(wrap);
}

// ===== Canvas 手写板 =====
function initWriteBoard(wrap) {
  const canvas = wrap.querySelector('#writeCanvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.touchAction = 'none';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  canvas.__ctx = ctx;

  const getPos = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    writeDrawing = true;
    const p = getPos(e);
    writeStrokeId += 1;
    writeStrokes.push({
      id: String(writeStrokeId),
      color: writeColor,
      width: writeWidth,
      points: [{ x: p.x, y: p.y, t: performance.now() }],
    });
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!writeDrawing) return;
    const st = writeStrokes[writeStrokes.length - 1];
    const p = getPos(e);
    st.points.push({ x: p.x, y: p.y, t: performance.now() });
    drawWriteCanvas(wrap, true);
  });

  const endStroke = (e) => {
    if (!writeDrawing) return;
    writeDrawing = false;
    const st = writeStrokes[writeStrokes.length - 1];
    if (st && st.points.length < 2) {
      // 单击：画一个点
      const p = st.points[0];
      st.points.push({ x: p.x + 0.1, y: p.y + 0.1, t: p.t + 1 });
    }
  };
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);

  // 颜色
  wrap.querySelectorAll('.write-color').forEach((btn) => {
    btn.addEventListener('click', () => {
      writeColor = btn.dataset.color;
      wrap.querySelectorAll('.write-color').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });
  // 粗细
  wrap.querySelectorAll('.write-size').forEach((btn) => {
    btn.addEventListener('click', () => {
      writeWidth = Number(btn.dataset.size);
      wrap.querySelectorAll('.write-size').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });
  // 撤销
  wrap.querySelector('#writeUndo').addEventListener('click', () => {
    writeStrokes.pop();
    drawWriteCanvas(wrap);
  });
  // 清除
  wrap.querySelector('#writeClear').addEventListener('click', () => {
    writeStrokes = [];
    writeStrokeId = 0;
    drawWriteCanvas(wrap);
  });
  // 提交
  wrap.querySelector('#writeSubmit').addEventListener('click', () => submitWrite(wrap));
  // 下一题
  wrap.querySelector('#writeNext').addEventListener('click', () => nextWriteQuestion(wrap));
  // 重置统计
  wrap.querySelector('#writeReset').addEventListener('click', () => {
    writeStats = { correct: 0, total: 0 };
    updateWriteStats(wrap);
  });

  // 窗口尺寸变化时重建画布
  window.addEventListener('resize', () => {
    if (!document.getElementById('writeCanvas')) return;
    const c = document.getElementById('writeCanvas');
    const r = c.getBoundingClientRect();
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    const ctx2 = c.getContext('2d');
    ctx2.scale(dpr, dpr);
    c.__ctx = ctx2;
    drawWriteCanvas();
  });
}

// 绘制画布：底稿（临摹模式）+ 笔迹
function drawWriteCanvas(wrap, incremental) {
  if (!wrap) wrap = document.getElementById('writePanel');
  if (!wrap) return;
  const canvas = wrap.querySelector('#writeCanvas');
  if (!canvas || !canvas.__ctx) return;
  const ctx = canvas.__ctx;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;
  ctx.clearRect(0, 0, W, H);

  // 十字参考线
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
  ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
  ctx.stroke();

  // 临摹底稿
  if (writeCurrent && writeCurrent.type === 'trace') {
    ctx.save();
    ctx.font = '110px "Hiragino Sans", "Yu Gothic UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(242,244,248,0.10)';
    ctx.fillText(writeCurrent.h, W / 2, H / 2 + 6);
    ctx.restore();
  }

  // 笔迹
  writeStrokes.forEach((st) => {
    if (!st.points.length) return;
    ctx.save();
    ctx.strokeStyle = st.color;
    ctx.lineWidth = st.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(st.points[0].x, st.points[0].y);
    for (let i = 1; i < st.points.length; i++) ctx.lineTo(st.points[i].x, st.points[i].y);
    ctx.stroke();
    ctx.restore();
  });
}

// ===== 判分 =====
async function submitWrite(wrap) {
  if (!wrap) wrap = document.getElementById('writePanel');
  if (!wrap) return;
  const fb = wrap.querySelector('#writeFeedback');
  if (!writeCurrent) return;

  if (writeStrokes.length === 0) {
    fb.className = 'write-feedback bad';
    fb.textContent = '请先在手写板上书写内容';
    return;
  }

  // 临摹模式：无判分，仅提示完成
  if (writeCurrent.type === 'trace') {
    fb.className = 'write-feedback ok';
    fb.textContent = '已记录笔迹。可继续跟写，或点「下一题」换一个假名。';
    return;
  }

  const answer = writeCurrent.type === 'word' ? writeCurrent.kana : writeCurrent.h;

  // 1) 自动识别（Chrome 实验性 API）
  let recognized = null;
  let usedAuto = false;
  try {
    if ('handwriting' in navigator && navigator.handwriting && navigator.handwriting.createModel) {
      const rect = wrap.querySelector('#writeCanvas').getBoundingClientRect();
      const model = await navigator.handwriting.createModel({ languages: ['ja'] });
      try {
        for (const st of writeStrokes) {
          const pts = st.points.map((p) => ({
            x: Math.max(0, Math.min(1, p.x / rect.width)),
            y: Math.max(0, Math.min(1, p.y / rect.height)),
            t: p.t,
          }));
          await model.addStroke({ points: pts, id: st.id });
        }
        const pred = await model.getPrediction();
        recognized = (pred && pred[0] && pred[0].text) ? String(pred[0].text).trim() : null;
        usedAuto = true;
      } finally {
        try { await model.deleteModel(); } catch (e) { /* ignore */ }
      }
    }
  } catch (e) {
    recognized = null;
    usedAuto = false;
  }

  const target = normAnswer(answer);
  const isMatch = recognized !== null && normAnswer(recognized) === target;

  if (usedAuto && recognized !== null) {
    // 自动识别成功
    writeStats.total += 1;
    if (isMatch) writeStats.correct += 1;
    updateWriteStats(wrap);
    fb.className = 'write-feedback ' + (isMatch ? 'ok' : 'bad');
    fb.innerHTML = isMatch
      ? `识别「${recognized}」— 正确！`
      : `识别「${recognized}」— 不对。正确答案是 <b>${answer}</b>`;
    return;
  }

  // 2) 降级：对照自评
  writeStats.total += 1;
  updateWriteStats(wrap);
  fb.className = 'write-feedback self';
  fb.innerHTML = `
    <div class="self-answer">正确答案：<b>${answer}</b>${writeCurrent.type === 'kana' ? '（' + writeCurrent.k + '）' : ''}</div>
    <div class="self-btns">
      <button class="btn-primary self-ok">写对了</button>
      <button class="btn-ghost self-no">写错了</button>
    </div>`;
  fb.querySelector('.self-ok').addEventListener('click', () => {
    writeStats.correct += 1;
    updateWriteStats(wrap);
    fb.className = 'write-feedback ok';
    fb.innerHTML = '已记录为正确。';
  });
  fb.querySelector('.self-no').addEventListener('click', () => {
    fb.className = 'write-feedback bad';
    fb.innerHTML = '已记录为错误。多练几次就记住了。';
  });
}

function updateWriteStats(wrap) {
  if (!wrap) wrap = document.getElementById('writePanel');
  if (!wrap) return;
  const rate = writeStats.total ? Math.round((writeStats.correct / writeStats.total) * 100) : 0;
  const c = wrap.querySelector('#statCorrect');
  const t = wrap.querySelector('#statTotal');
  const r = wrap.querySelector('#statRate');
  const b = wrap.querySelector('#statBar');
  if (c) c.textContent = writeStats.correct;
  if (t) t.textContent = writeStats.total;
  if (r) r.textContent = rate + '%';
  if (b) b.style.width = rate + '%';
}
