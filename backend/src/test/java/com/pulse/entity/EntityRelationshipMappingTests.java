package com.pulse.entity;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import org.junit.jupiter.api.Test;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class EntityRelationshipMappingTests {

    @Test
    void profileEntitiesMapBackToTheirUser() throws Exception {
        assertRelationship(Donor.class, "user", OneToOne.class, "user_id");
        assertRelationship(Hospital.class, "user", OneToOne.class, "user_id");
        assertRelationship(BloodBank.class, "user", OneToOne.class, "user_id");
    }

    @Test
    void transactionalEntitiesExposeTheirJpaRelationships() throws Exception {
        assertRelationship(BloodRequest.class, "requester", ManyToOne.class, "requester_user_id");
        assertRelationship(RequestResponse.class, "bloodRequest", ManyToOne.class, "blood_request_id");
        assertRelationship(RequestResponse.class, "responder", ManyToOne.class, "responder_user_id");
        assertRelationship(DonationEvent.class, "bloodBank", ManyToOne.class, "blood_bank_id");
        assertRelationship(EventEnrollment.class, "donationEvent", ManyToOne.class, "donation_event_id");
        assertRelationship(EventEnrollment.class, "donor", ManyToOne.class, "donor_id");
        assertRelationship(BloodStock.class, "bloodBank", ManyToOne.class, "blood_bank_id");
        assertRelationship(Notification.class, "user", ManyToOne.class, "user_id");
    }

    private void assertRelationship(
            Class<?> entityType,
            String fieldName,
            Class<? extends Annotation> relationshipType,
            String columnName
    ) throws Exception {
        Field field = entityType.getDeclaredField(fieldName);
        assertNotNull(field.getAnnotation(relationshipType));

        JoinColumn joinColumn = field.getAnnotation(JoinColumn.class);
        assertNotNull(joinColumn);
        assertEquals(columnName, joinColumn.name());
        assertFalse(joinColumn.insertable());
        assertFalse(joinColumn.updatable());
    }
}
