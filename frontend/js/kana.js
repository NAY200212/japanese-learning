// ===== 五十音フル＋手書き書き取り練習（86 メカ感） =====
// データ：清音 46＋濁音 20＋半濁音 5＋拗音 33＝104 個の仮名
// 機能：分類タブで閲覧（クリックで発音/詳細表示、清音は習得マーク対応）＋手書き練習（なぞり/仮名書き取り/単語書き取り）
// 採点：navigator.handwriting（Chrome on-device）優先。利用不可なら「見比べて自己採点」へフォールバック
// 互換：app.js が renderKana() を直接呼び出し。バックエンド利用不可時は純ローカル表示へフォールバック

const KANA_CATS = [
  { id: 'seion', label: '清音', sub: 'SEION' },
  { id: 'dakuon', label: '浊音', sub: 'DAKUON' },
  { id: 'handakuon', label: '半浊音', sub: 'HANDAKUON' },
  { id: 'youon', label: '拗音', sub: 'YOUON' },
];
const KANA_CAT_MAP = Object.fromEntries(KANA_CATS.map((c) => [c.id, c]));

// フィールド：h 平仮名 / k 片仮名 / r ローマ字 / cat 分類 / sc 画数 / ex 例示語(仮名) / ej 例示語(漢字、空可) / ec 例示語(中国語)
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
  // ===== 濁音 20 =====
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
  // ===== 半濁音 5 =====
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

// ===== 内蔵 N5 単語表（仮名＋中国語訳、単語書き取り用） =====
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

// ===== 状態 ===== 
let kanaCat = 'seion';        // 現在の分類タブ
let kanaMastered = [];        // 習得済みの仮名（バックエンドのデータ。清音のみ有効）
let kanaSelected = null;      // 現在選択中の仮名（詳細パネル）
let writeMode = 'trace';      // trace | kana | word
let writePool = 'cat';        // cat=現在の分類 | all=すべて
let writeStats = { correct: 0, total: 0 };
let writeCurrent = null;      // 現在の問題
let writeStrokes = [];        // 手書きのストローク [{id,color,width,points:[{x,y,t}]}]
let writeColor = '#f2f4f8';   // ストロークの色
let writeWidth = 6;           // ストロークの太さ
let writeDrawing = false;     // 描画中かどうか
let writeStrokeId = 0;

// ===== ユーティリティ関数 =====
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
  } catch (e) { /* 静かにフォールバック */ }
}

// 平仮名 -> 片仮名（正規化比較用）
function toKatakana(s) {
  return String(s || '').replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}
// 回答の正規化：空白/区切りを除去し、片仮名に統一
function normAnswer(s) {
  return toKatakana(s).replace(/[\s\-・、。.!！?？]/g, '');
}

// ===== バックエンドの習得進捗（失敗時は静かにフォールバック） =====
async function loadKanaProgress() {
  try {
    const list = await api('/kana/progress');
    kanaMastered = Array.isArray(list) ? list : [];
  } catch (e) {
    kanaMastered = [];
  }
}

// ===== メインレンダリング（app.js が呼び出すエントリ） =====
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

// ===== 一、仮名ブラウズ（分類タブ＋カードグリッド） =====
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

  // タブ切り替え
  wrap.querySelectorAll('.kana-cat-seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      kanaCat = btn.dataset.cat;
      kanaSelected = null;
      renderKanaBrowser();
    });
  });

  // カードクリック：詳細表示＋発音
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

// ===== 二、手書き練習 =====
function renderWritePanel() {
  const wrap = document.getElementById('writePanel');
  if (!wrap) return;

  // パネル再構築前に描画状態をリセットし、旧キャンバス破棄時に pointerup が失われて状態が固まるのを防ぐ
  writeDrawing = false;
  if (window.__kanaRafPending) {
    window.__kanaRafPending = false;
  }

  const autoMode = 'handwriting' in navigator && !!navigator.handwriting;

  wrap.innerHTML = `
    <div class="write-panel scanline">
      <div class="write-head">
        <h3 class="card-title">手写练习 <small>HANDWRITING DRILL</small></h3>
        <span class="write-mode-badge ${autoMode ? 'auto' : 'auto'}">自动判分：${autoMode ? '系统识别' : '本地模板'}</span>
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

  // モード / 問題集の切り替え：ハイライト更新と再出題のみ行い、DOM 全体は再構築しない（重複初期化とカクつきを回避）
  wrap.querySelectorAll('.write-mode-seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (writeMode === btn.dataset.mode) return;
      writeMode = btn.dataset.mode;
      writeStrokes = [];
      wrap.querySelectorAll('.write-mode-seg button').forEach((b) => b.classList.toggle('active', b === btn));
      nextWriteQuestion(wrap);
    });
  });
  wrap.querySelectorAll('.write-pool-seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (writePool === btn.dataset.pool) return;
      writePool = btn.dataset.pool;
      writeStrokes = [];
      wrap.querySelectorAll('.write-pool-seg button').forEach((b) => b.classList.toggle('active', b === btn));
      nextWriteQuestion(wrap);
    });
  });

  initWriteBoard(wrap);
  nextWriteQuestion(wrap);
}

// 現在の問題集を取得（仮名問題）
function writeKanaPool() {
  return writePool === 'all' ? KANA_DATA.slice() : kanaOfCat(kanaCat);
}

// 次の問題
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

  // 出題パネル
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

  // キャンバスを再描画（なぞりモードでは下書きを描く）
  drawWriteCanvas(wrap);
}

// ===== Canvas 手書きボード =====
function initWriteBoard(wrap) {
  const canvas = wrap.querySelector('#writeCanvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return; // レイアウト未完了ならスキップし、0 サイズのキャンバスを回避
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
    // RAF スロットル：高頻度 pointermove は毎フレーム最後の再描画だけを残し、メインスレッドの過負荷を防ぐ
    if (window.__kanaRafPending) return;
    window.__kanaRafPending = true;
    requestAnimationFrame(() => {
      window.__kanaRafPending = false;
      drawWriteCanvas(wrap, true);
    });
  });

  const endStroke = (e) => {
    if (!writeDrawing) return;
    writeDrawing = false;
    const st = writeStrokes[writeStrokes.length - 1];
    if (st && st.points.length < 2) {
      // シングルクリック：点を 1 つ描く
      const p = st.points[0];
      st.points.push({ x: p.x + 0.1, y: p.y + 0.1, t: p.t + 1 });
    }
  };
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);

  // 色
  wrap.querySelectorAll('.write-color').forEach((btn) => {
    btn.addEventListener('click', () => {
      writeColor = btn.dataset.color;
      wrap.querySelectorAll('.write-color').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });
  // 太さ
  wrap.querySelectorAll('.write-size').forEach((btn) => {
    btn.addEventListener('click', () => {
      writeWidth = Number(btn.dataset.size);
      wrap.querySelectorAll('.write-size').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });
  // 元に戻す
  wrap.querySelector('#writeUndo').addEventListener('click', () => {
    writeStrokes.pop();
    drawWriteCanvas(wrap);
  });
  // クリア
  wrap.querySelector('#writeClear').addEventListener('click', () => {
    writeStrokes = [];
    writeStrokeId = 0;
    drawWriteCanvas(wrap);
  });
  // 提出
  wrap.querySelector('#writeSubmit').addEventListener('click', () => submitWrite(wrap));
  // 次の問題
  wrap.querySelector('#writeNext').addEventListener('click', () => nextWriteQuestion(wrap));
  // 統計をリセット
  wrap.querySelector('#writeReset').addEventListener('click', () => {
    writeStats = { correct: 0, total: 0 };
    updateWriteStats(wrap);
  });

  // ウィンドウサイズ変更時はキャンバスを再構築：登録は一度だけ（ガードフラグ）、
  // renderWritePanel / renderKana を繰り返し再構築してもリスナーが無限に蓄積してカクつくのを防ぐ
  if (!window.__kanaResizeBound) {
    window.__kanaResizeBound = true;
    window.addEventListener('resize', () => {
      const c = document.getElementById('writeCanvas');
      if (!c) return;
      const r = c.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const dprNow = window.devicePixelRatio || 1;
      c.width = r.width * dprNow;
      c.height = r.height * dprNow;
      const ctx2 = c.getContext('2d');
      ctx2.scale(dprNow, dprNow);
      c.__ctx = ctx2;
      drawWriteCanvas();
    });
  }
}

// 描画キャンバス：下書き（なぞりモード）＋ストローク
function drawWriteCanvas(wrap, incremental) {
  if (!wrap) wrap = document.getElementById('writePanel');
  if (!wrap) return;
  const canvas = wrap.querySelector('#writeCanvas');
  if (!canvas || !canvas.__ctx) return;
  const ctx = canvas.__ctx;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;

  // 差分描画：現在のストロークの新規部分だけを描き、クリアと下書きをスキップ（旧内容は描画済み）
  if (incremental && writeStrokes.length > 0) {
    const st = writeStrokes[writeStrokes.length - 1];
    // start-1 から描き始め、前フレーム末尾から本フレーム始点への接続部分を補完し、ストロークの断裂を防ぐ
    const start = Math.max(0, (st.drawnPoints || 0) - 1);
    if (start < st.points.length) {
      ctx.save();
      ctx.strokeStyle = st.color;
      ctx.lineWidth = st.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(st.points[start].x, st.points[start].y);
      for (let i = start + 1; i < st.points.length; i++) ctx.lineTo(st.points[i].x, st.points[i].y);
      ctx.stroke();
      ctx.restore();
      st.drawnPoints = st.points.length;
    }
    return;
  }

  ctx.clearRect(0, 0, W, H);

  // 十字の参照線
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
  ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
  ctx.stroke();

  // なぞり用の下書き
  if (writeCurrent && writeCurrent.type === 'trace') {
    ctx.save();
    ctx.font = '110px "Hiragino Sans", "Yu Gothic UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(242,244,248,0.10)';
    ctx.fillText(writeCurrent.h, W / 2, H / 2 + 6);
    ctx.restore();
  }

  // ストローク
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
    // 全量再描画後に差分カーソルを同期し、以後の差分描画の始点が正しいことを保証
    st.drawnPoints = st.points.length;
  });
}

// ===== 採点 =====
// ---- ローカルテンプレートマッチング自動採点（ブラウザの handwriting API 非依存。Chrome/Safari とも利用可）----
const KANA_TPL_SIZE = 96;
const kanaTplCache = new Map();

// システムフォントでオフスクリーンキャンバスに仮名を描画し、二値テンプレートを生成（raw=元ストローク、mask=1 周膨張で誤差許容）
// テンプレートはストローク描画＋bbox 正規化で生成し、ユーザーストロークと同型（線と線で比較）
function getKanaTemplateBitmap(ch) {
  if (kanaTplCache.has(ch)) return kanaTplCache.get(ch);
  const S = KANA_TPL_SIZE;
  const font = '700 ' + Math.round(S * 0.74) + 'px "Hiragino Sans", "Yu Gothic UI", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif';

  // 1 回目：塗りつぶし描画で字形の bbox を計測
  const c1 = document.createElement('canvas');
  c1.width = S; c1.height = S;
  const ctx1 = c1.getContext('2d', { willReadFrequently: true });
  ctx1.font = font;
  ctx1.textAlign = 'center';
  ctx1.textBaseline = 'middle';
  ctx1.fillStyle = '#000';
  ctx1.fillText(ch, S / 2, S / 2 + S * 0.02);
  const img1 = ctx1.getImageData(0, 0, S, S);
  let minX = S, minY = S, maxX = -1, maxY = -1;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (img1.data[(y * S + x) * 4 + 3] > 60) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) { minX = 0; minY = 0; maxX = S - 1; maxY = S - 1; }
  const bw = Math.max(1, maxX - minX + 1);
  const bh = Math.max(1, maxY - minY + 1);

  // 2 回目：ストローク描画で字形を描画（ユーザーストロークと同じく線・線幅一致）
  const c2 = document.createElement('canvas');
  c2.width = S; c2.height = S;
  const ctx2 = c2.getContext('2d', { willReadFrequently: true });
  ctx2.font = font;
  ctx2.textAlign = 'center';
  ctx2.textBaseline = 'middle';
  ctx2.strokeStyle = '#000';
  ctx2.lineWidth = Math.max(3, S * 0.055);
  ctx2.lineCap = 'round';
  ctx2.lineJoin = 'round';
  ctx2.strokeText(ch, S / 2, S / 2 + S * 0.02);

  // 字形を切り出して 0.62*S に正規化し中央へ（ユーザーストロークの bbox 正規化と一致させる）
  const out = document.createElement('canvas');
  out.width = S; out.height = S;
  const octx = out.getContext('2d');
  const target = Math.round(S * 0.62);
  const scale = target / Math.max(bw, bh);
  const dw = Math.max(1, Math.round(bw * scale));
  const dh = Math.max(1, Math.round(bh * scale));
  octx.drawImage(c2, minX, minY, bw, bh, Math.round((S - dw) / 2), Math.round((S - dh) / 2), dw, dh);

  const img = octx.getImageData(0, 0, S, S);
  const raw = new Uint8Array(S * S);
  for (let i = 0; i < raw.length; i++) {
    if (img.data[i * 4 + 3] > 60 && img.data[i * 4] + img.data[i * 4 + 1] + img.data[i * 4 + 2] < 500) raw[i] = 1;
  }
  const mask = new Uint8Array(raw.length);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (raw[y * S + x]) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < S && ny < S) mask[ny * S + nx] = 1;
          }
        }
      }
    }
  }
  kanaTplCache.set(ch, { raw, mask });
  return kanaTplCache.get(ch);
}

// ユーザーストロークを平行移動＋スケールでテンプレートキャンバスに正規化し、二値 mask を返す
function renderUserStrokesBitmap(wrap) {
  const canvas = wrap.querySelector('#writeCanvas');
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 1, H = rect.height || 1;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const strokes = [];
  for (const st of writeStrokes) {
    if (!st.points.length) continue;
    const pts = [];
    for (const p of st.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      pts.push({ x: p.x, y: p.y });
    }
    strokes.push(pts);
  }
  if (!strokes.length || !isFinite(minX)) return null;
  const bw = Math.max(1, maxX - minX);
  const bh = Math.max(1, maxY - minY);
  const S = KANA_TPL_SIZE;
  const scale = (S * 0.62) / Math.max(bw, bh);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;

  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(3, S * 0.055);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const pts of strokes) {
    ctx.beginPath();
    ctx.moveTo(S / 2 + (pts[0].x - cx) * scale, S / 2 + (pts[0].y - cy) * scale);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(S / 2 + (pts[i].x - cx) * scale, S / 2 + (pts[i].y - cy) * scale);
    ctx.stroke();
  }
  const img = ctx.getImageData(0, 0, S, S);
  const mask = new Uint8Array(S * S);
  for (let i = 0; i < mask.length; i++) {
    if (img.data[i * 4 + 3] > 60 && img.data[i * 4] + img.data[i * 4 + 1] + img.data[i * 4 + 2] < 500) mask[i] = 1;
  }
  return mask;
}

// 双方向ヒット率スコア：hitU=ユーザーストロークがテンプレート膨張領域に入る割合（許容）、hitT=テンプレートがユーザーに正確に覆われた割合（区別）
function matchKanaScore(userMask, ch) {
  const tpl = getKanaTemplateBitmap(ch);
  const S = KANA_TPL_SIZE;
  let userTotal = 0, tplTotal = 0, interE = 0, interR = 0;
  for (let i = 0; i < S * S; i++) {
    if (userMask[i]) {
      userTotal++;
      if (tpl.mask[i]) interE++;
      if (tpl.raw[i]) interR++;
    }
    if (tpl.raw[i]) tplTotal++;
  }
  const hitU = userTotal ? interE / userTotal : 0;
  const hitT = tplTotal ? interR / tplTotal : 0;
  // hitT が区別要素（ユーザーがテンプレートの全ストロークを覆ったか）。重みを高く。hitU は膨張 mask で軽微なズレを許容
  return { score: 0.3 * hitU + 0.7 * hitT, hitU, hitT };
}

// 複数候補認識：まず画数が一致する仮名から最高点を選ぶ（似た字形は画数が異なることが多く除外可能）。点数が低すぎる場合は全候補の最良へフォールバック
function bestKanaMatch(userMask, strokeCount) {
  let best = null, fallback = null;
  for (const d of KANA_DATA) {
    const s = matchKanaScore(userMask, d.h);
    const item = { ch: d.h, sc: d.sc, score: s.score, hitU: s.hitU, hitT: s.hitT };
    if (strokeCount && d.sc === strokeCount) {
      if (!best || s.score > best.score) best = item;
    } else if (!fallback || s.score > fallback.score) {
      fallback = item;
    }
  }
  return best && best.score >= 0.30 ? best : (fallback || best);
}

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

  // なぞりモード：採点なし、完了表示のみ
  if (writeCurrent.type === 'trace') {
    fb.className = 'write-feedback ok';
    fb.textContent = '已记录笔迹。可继续跟写，或点「下一题」换一个假名。';
    return;
  }

  const answer = writeCurrent.type === 'word' ? writeCurrent.kana : writeCurrent.h;

  // 1) 自動認識（Chrome の実験的 API）
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

  // 2) 単語モード：複数文字の組み合わせはテンプレートマッチングせず、handwriting が無ければ「見比べて自己採点」を維持
  if (writeCurrent.type === 'word') {
    const wMatch = usedAuto && recognized !== null && normAnswer(recognized) === target;
    writeStats.total += 1;
    updateWriteStats(wrap);
    if (usedAuto && recognized !== null) {
      if (wMatch) writeStats.correct += 1;
      fb.className = 'write-feedback ' + (wMatch ? 'ok' : 'bad');
      fb.innerHTML = wMatch
        ? `识别「${recognized}」— 正确！`
        : `识别「${recognized}」— 不对。正确答案是 <b>${answer}</b>`;
      return;
    }
    fb.className = 'write-feedback self';
    fb.innerHTML = `
      <div class="self-answer">正确答案：<b>${answer}</b></div>
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
    return;
  }

  // 3) 仮名モード：handwriting 優先。利用不可/失敗時はローカルテンプレートマッチングの自動採点（Safari でも有効）
  const userMask = renderUserStrokesBitmap(wrap);

  writeStats.total += 1;
  updateWriteStats(wrap);

  if (usedAuto && recognized !== null) {
    const isMatch = normAnswer(recognized) === target;
    if (isMatch) {
      writeStats.correct += 1;
      updateWriteStats(wrap);
    }
    fb.className = 'write-feedback ' + (isMatch ? 'ok' : 'bad');
    fb.innerHTML = isMatch
      ? `识别「${recognized}」— 正确！`
      : `识别「${recognized}」— 不对。正确答案是 <b>${answer}</b>（${writeCurrent.k}）`;
    return;
  }

  if (userMask) {
    const best = bestKanaMatch(userMask, writeStrokes.length);
    if (best) {
      const ok = normAnswer(best.ch) === target && best.score >= 0.40 && best.hitT >= 0.18;
      if (ok) {
        writeStats.correct += 1;
        updateWriteStats(wrap);
      }
      fb.className = 'write-feedback ' + (ok ? 'ok' : 'bad');
      fb.innerHTML = ok
        ? `识别为「${best.ch}」，匹配度 ${Math.round(best.score * 100)}% — 正确！`
        : `识别为「${best.ch}」，匹配度 ${Math.round(best.score * 100)}% — 不对。正确答案是 <b>${answer}</b>（${writeCurrent.k}）`;
      return;
    }
  }

  // 4) フォールバック：見比べて自己採点
  fb.className = 'write-feedback self';
  fb.innerHTML = `
    <div class="self-answer">正确答案：<b>${answer}</b>（${writeCurrent.k}）</div>
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
