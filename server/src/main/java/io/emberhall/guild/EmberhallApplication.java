package io.emberhall.guild;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class EmberhallApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmberhallApplication.class, args);
    }
}
