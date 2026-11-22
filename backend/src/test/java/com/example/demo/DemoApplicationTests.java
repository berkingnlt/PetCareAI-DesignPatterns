package com.example.demo;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requires an available MariaDB instance; run manually with local environment configured.")
class DemoApplicationTests {
    @Test void contextLoads() { }
}
