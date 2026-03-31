package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// StringArray is a custom type for storing string arrays as JSON in PostgreSQL
type StringArray []string

func (s StringArray) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	b, err := json.Marshal(s)
	return string(b), err
}

func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = StringArray{}
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case string:
		bytes = []byte(v)
	case []byte:
		bytes = v
	default:
		return fmt.Errorf("cannot scan type %T into StringArray", value)
	}
	return json.Unmarshal(bytes, s)
}

// IntArray is a custom type for storing int arrays as JSON in PostgreSQL
type IntArray []int

func (s IntArray) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	b, err := json.Marshal(s)
	return string(b), err
}

func (s *IntArray) Scan(value interface{}) error {
	if value == nil {
		*s = IntArray{}
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case string:
		bytes = []byte(v)
	case []byte:
		bytes = v
	default:
		return fmt.Errorf("cannot scan type %T into IntArray", value)
	}
	return json.Unmarshal(bytes, s)
}

// Alert represents a user-defined alert for a subscription or a standalone custom reminder.
//
// AlertType:
//   - "renewal"    → triggered relative to next_billing_date for autopay subscriptions
//   - "expiration" → triggered relative to next_billing_date for manual/one-time subscriptions
//   - "custom"     → triggered on a specific CustomDate (standalone reminder)
//
// TriggerOffsets: []int of days-before values, e.g. [7, 2, 1]
// TriggeredOffsets: tracks which offsets have already fired to prevent re-sends
// Recipients: up to 5 email addresses that receive the alert emails
type Alert struct {
	ID               uint        `gorm:"primaryKey" json:"id"`
	UserID           uint        `gorm:"index;not null" json:"user_id"`
	OrgID            uint        `gorm:"index;not null" json:"org_id"`
	SubscriptionID   *uint       `gorm:"index" json:"subscription_id"` // null for custom/standalone alerts
	AlertType        string      `gorm:"not null;default:'renewal'" json:"alert_type"` // "renewal" | "expiration" | "custom"
	TriggerOffsets   IntArray    `gorm:"type:text;default:'[]'" json:"trigger_offsets"`  // days before: [7, 2, 1]
	TriggeredOffsets IntArray    `gorm:"type:text;default:'[]'" json:"triggered_offsets"` // already-fired offsets
	CustomDate       *time.Time  `json:"custom_date"`  // for custom alerts
	CustomTitle      string      `json:"custom_title"` // free-text title for custom alerts
	Recipients       StringArray `gorm:"type:text;default:'[]'" json:"recipients"` // up to 5 emails
	Status           string      `gorm:"default:'active'" json:"status"` // "active" | "triggered" | "dismissed"
	CreatedAt        time.Time   `json:"created_at"`
	UpdatedAt        time.Time   `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
