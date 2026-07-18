package com.pulse.config;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

/** Allows Google App Passwords to be pasted in their grouped "xxxx xxxx xxxx xxxx" form. */
@Component
public class MailPasswordNormalizer implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof JavaMailSenderImpl sender && sender.getPassword() != null) {
            sender.setPassword(sender.getPassword().replaceAll("\\s+", ""));
        }
        return bean;
    }
}
