package com.japaneselearning.service;

import com.japaneselearning.entity.Word;
import java.util.List;

public interface WordService {

    // レベル別に単語をページング取得（level は空可）
    List<Word> findByLevel(String level,int page,int size);

    // レベル別に総数を集計（level は空可）
    int countByLevel(String level);

    // 指定 id の単語詳細を取得
    Word findById(Integer id);

}
