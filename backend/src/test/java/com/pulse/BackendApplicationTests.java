package com.pulse;

import com.pulse.entity.Role;
import com.pulse.entity.User;
import com.pulse.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

	@Autowired
	private UserRepository userRepository;

	@Test
	void contextLoads() {
	}

	@Test
	@Transactional
	void hibernatePersistsAndQueriesUsers() {
		User saved = userRepository.saveAndFlush(User.builder()
				.email("integration@pulse.test")
				.passwordHash("hashed-password")
				.role(Role.DONOR)
				.verified(true)
				.build());

		assertTrue(saved.getId() > 0);
		assertEquals(saved.getId(), userRepository.findByEmail("integration@pulse.test").orElseThrow().getId());
	}

}
