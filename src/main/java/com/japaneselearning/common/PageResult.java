package com.japaneselearning.common;

import lombok.Data;
import java.util.List;

@Data
public class PageResult<T> {
    private List<T> list;       // 当前页数据
    private long total;         // 总条数
    private int page;           // 当前页码
    private int size;           // 每页条数
    private int totalPages;     // 总页数

    public PageResult(List<T> list, long total, int page, int size) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.size = size;
        this.totalPages = (int) Math.ceil((double) total / size);
    }
}
