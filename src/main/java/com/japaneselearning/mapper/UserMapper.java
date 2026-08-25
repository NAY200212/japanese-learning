package com.japaneselearning.mapper;

import com.japaneselearning.entity.User;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {

    // 根据用户名查用户（登录时用）
    @Select("SELECT * FROM `user` WHERE username = #{username}")
    User findByUsername(String username);

    // 插入新用户（注册时用），useGeneratedKeys 自动把自增 id 填回 user 对象
    @Insert("INSERT INTO `user` (username, password, email) VALUES (#{username}, #{password}, #{email})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    @Select("SELECT * FROM user WHERE id = #{id}")
    User findById(@Param("id") Long id);

}
