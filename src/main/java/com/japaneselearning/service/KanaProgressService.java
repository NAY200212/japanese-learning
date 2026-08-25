package com.japaneselearning.service;

import java.util.List;

public interface KanaProgressService {

    // 查某用户已掌握假名列表
    List<String> listByUser(Integer userId);

    // 设置掌握状态：mastered=true 添加，false 取消
    void setMastered(Integer userId, String hiragana, boolean mastered);

    // 统计掌握数量
    int countByUser(Integer userId);
}
