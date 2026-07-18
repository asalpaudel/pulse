package com.pulse.dto;

import com.pulse.dto.BloodBankDtos.StockUpsertItem;
import com.pulse.dto.DonorDtos.DonorUpdateRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class ProfileValidationTests {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsUnsafeProfileAndInventoryValues() {
        var constructor = DonorUpdateRequest.class.getDeclaredConstructors()[0];
        Object[] values = new Object[constructor.getParameterCount()];
        values[0] = "A";
        values[2] = "invalid";
        values[3] = 91D;
        values[4] = 181D;
        values[5] = "x".repeat(501);
        values[6] = true;
        values[7] = LocalDate.now().plusDays(1);
        Object donor;
        try {
            donor = constructor.newInstance(values);
        } catch (ReflectiveOperationException ex) {
            throw new AssertionError(ex);
        }
        StockUpsertItem stock = new StockUpsertItem(null, -1);

        assertThat(validator.validate(donor)).hasSizeGreaterThanOrEqualTo(6);
        assertThat(validator.validate(stock)).hasSize(2);
    }
}
