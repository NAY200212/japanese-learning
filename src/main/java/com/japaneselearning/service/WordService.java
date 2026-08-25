package com.japaneselearning.service;

import com.japaneselearning.entity.Word;
import java.util.List;

public interface WordService {

    // 按等级分页查单词（level 可为空）
    List<Word> findByLevel(String level,int page,int size);

    // 按等级统计总数（level 可为空）
    int countByLevel(String level);

    // 根据 id 查单词详情
    Word findById(Integer id);

}
