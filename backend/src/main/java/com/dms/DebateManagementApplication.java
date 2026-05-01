package com.dms;

import com.dms.config.DotenvInitializer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DebateManagementApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(DebateManagementApplication.class);
        app.addInitializers(new DotenvInitializer());
        app.run(args);
    }
}
