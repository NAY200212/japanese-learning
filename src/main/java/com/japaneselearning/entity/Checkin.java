package com.japaneselearning.entity;

import lombok.Data;

import java.time.LocalDate;

@Data
public class Checkin {
    private Integer id;
    private Integer userId;
    private LocalDate checkinDate;
    private Integer tasksDone;
    private Integer wordsDone;

}
