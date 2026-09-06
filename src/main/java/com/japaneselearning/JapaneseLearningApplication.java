package com.japaneselearning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling   // ← この行を追加して定期タスクを有効化

public class JapaneseLearningApplication {

	public static void main(String[] args) {
		SpringApplication.run(JapaneseLearningApplication.class, args);
	}

}
