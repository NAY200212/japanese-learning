package com.japaneselearning.service.impl;

import com.japaneselearning.entity.Kana;
import com.japaneselearning.service.KanaService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class KanaServiceImpl implements KanaService {

    // 46 个清音数据（平假名, 片假名, 罗马音）
    private static final List<Kana> KANA_LIST = new ArrayList<>();

    static {
        add("あ", "ア", "a");
        add("い", "イ", "i");
        add("う", "ウ", "u");
        add("え", "エ", "e");
        add("お", "オ", "o");
        add("か", "カ", "ka");
        add("き", "キ", "ki");
        add("く", "ク", "ku");
        add("け", "ケ", "ke");
        add("こ", "コ", "ko");
        add("さ", "サ", "sa");
        add("し", "シ", "shi");
        add("す", "ス", "su");
        add("せ", "セ", "se");
        add("そ", "ソ", "so");
        add("た", "タ", "ta");
        add("ち", "チ", "chi");
        add("つ", "ツ", "tsu");
        add("て", "テ", "te");
        add("と", "ト", "to");
        add("な", "ナ", "na");
        add("に", "ニ", "ni");
        add("ぬ", "ヌ", "nu");
        add("ね", "ネ", "ne");
        add("の", "ノ", "no");
        add("は", "ハ", "ha");
        add("ひ", "ヒ", "hi");
        add("ふ", "フ", "fu");
        add("へ", "ヘ", "he");
        add("ほ", "ホ", "ho");
        add("ま", "マ", "ma");
        add("み", "ミ", "mi");
        add("む", "ム", "mu");
        add("め", "メ", "me");
        add("も", "モ", "mo");
        add("や", "ヤ", "ya");
        add("ゆ", "ユ", "yu");
        add("よ", "ヨ", "yo");
        add("ら", "ラ", "ra");
        add("り", "リ", "ri");
        add("る", "ル", "ru");
        add("れ", "レ", "re");
        add("ろ", "ロ", "ro");
        add("わ", "ワ", "wa");
        add("を", "ヲ", "wo");
        add("ん", "ン", "n");
    }

    private static void add(String hiragana, String katakana, String romaji) {
        Kana kana = new Kana();
        kana.setHiragana(hiragana);
        kana.setKatakana(katakana);
        kana.setRomaji(romaji);
        KANA_LIST.add(kana);
    }

    @Override
    @Cacheable(cacheNames = "kana:all", key = "'all'")
    public List<Kana> getAll() {
        return KANA_LIST;
    }

    @Override
    public List<Kana> getRandom(int count) {
        List<Kana> copy = new ArrayList<>(KANA_LIST);
        Collections.shuffle(copy);          // 打乱顺序
        if (count >= copy.size()) {
            return copy;                    // count 超过总数就全给
        }
        return copy.subList(0, count);      // 取前 count 个
    }
}
