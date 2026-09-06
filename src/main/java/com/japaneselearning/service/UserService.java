package com.japaneselearning.service;

import com.japaneselearning.entity.User;

public interface UserService {

    // 登録：ユーザー名が既存なら false、成功なら true を返す
    boolean register(String username, String password, String email);

    // ログイン：ユーザー名とパスワードが一致すれば User を返し、一致しなければ null を返す
    User login(String username, String password);

    /*指定 id のユーザーを取得（ログイン後の個人情報取得用） */
    User findById(Long id);

}
