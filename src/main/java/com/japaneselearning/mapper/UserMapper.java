package com.japaneselearning.mapper;

import com.japaneselearning.entity.User;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {

    // ユーザー名でユーザーを検索（ログイン時）
    @Select("SELECT * FROM `user` WHERE username = #{username}")
    User findByUsername(String username);

    // 新規ユーザーを挿入（登録時）。useGeneratedKeys により自動採番 id を user オブジェクトへ書き戻す
    @Insert("INSERT INTO `user` (username, password, email) VALUES (#{username}, #{password}, #{email})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    @Select("SELECT * FROM user WHERE id = #{id}")
    User findById(@Param("id") Long id);

}
