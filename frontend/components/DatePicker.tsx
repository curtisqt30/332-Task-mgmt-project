import { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";

type DatePickerProps = {
  visible: boolean;
  selectedDate?: string | null; // YYYY-MM-DD format
  onSelectDate: (date: string | null) => void;
  onClose: () => void;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DatePicker({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
}: DatePickerProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Parse selected date when component mounts or selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate + "T00:00:00");
      if (!isNaN(date.getTime())) {
        setCurrentMonth(date.getMonth());
        setCurrentYear(date.getFullYear());
        setSelectedDay(date.getDate());
      }
    } else {
      setSelectedDay(null);
    }
  }, [selectedDate, visible]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const formattedDate = formatDate(currentYear, currentMonth, day);
    onSelectDate(formattedDate);
    onClose();
  };

  const handleClearDate = () => {
    setSelectedDay(null);
    onSelectDate(null);
    onClose();
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(today.getDate());
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={{ width: 40, height: 40 }} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentYear, currentMonth, day);
      const isToday = 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear();
      const isSelected = 
        selectedDate === dateStr ||
        (selectedDay === day && 
         currentMonth === new Date(selectedDate + "T00:00:00").getMonth() &&
         currentYear === new Date(selectedDate + "T00:00:00").getFullYear());

      days.push(
        <Pressable
          key={day}
          onPress={() => handleSelectDay(day)}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            backgroundColor: isSelected ? Colors.primary : isToday ? "#EEF2FF" : "transparent",
            borderWidth: isToday && !isSelected ? 1 : 0,
            borderColor: Colors.primary,
          }}
        >
          <Text style={{
            color: isSelected ? "white" : isToday ? Colors.primary : Colors.text,
            fontWeight: isSelected || isToday ? "700" : "500",
            fontSize: 14,
          }}>
            {day}
          </Text>
        </Pressable>
      );
    }

    // Add empty cells to complete the last row (7 days total)
    const totalCells = days.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <View key={`empty-end-${i}`} style={{ width: 40, height: 40 }} />
      );
    }

    return days;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}>
        <View style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          width: "100%",
          maxWidth: 360,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}>
          {/* Header */}
          <View style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
          }}>
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <Pressable
                onPress={goToPreviousMonth}
                style={{
                  width: 32,
                  height: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  backgroundColor: "#F8FAFC",
                }}
              >
                <Text style={{ fontSize: 18, color: Colors.text }}>‹</Text>
              </Pressable>

              <Text style={{
                fontSize: 16,
                fontWeight: "700",
                color: Colors.text,
              }}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>

              <Pressable
                onPress={goToNextMonth}
                style={{
                  width: 32,
                  height: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  backgroundColor: "#F8FAFC",
                }}
              >
                <Text style={{ fontSize: 18, color: Colors.text }}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* Calendar */}
          <View style={{ padding: 16 }}>
            {/* Weekday labels */}
            <View style={{
              flexDirection: "row",
              marginBottom: 8,
            }}>
              {WEEKDAYS.map((day) => (
                <Text
                  key={day}
                  style={{
                    width: 40,
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: "600",
                    color: Colors.secondary,
                    marginHorizontal: 4,
                  }}
                >
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar days */}
            <View style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}>
              {renderCalendarDays()}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{
            paddingHorizontal: 16,
            paddingBottom: 8,
            flexDirection: "row",
            justifyContent: "center",
            gap: 12,
          }}>
            <Pressable
              onPress={goToToday}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: "#EEF2FF",
              }}
            >
              <Text style={{
                color: Colors.primary,
                fontSize: 13,
                fontWeight: "600",
              }}>
                Today
              </Text>
            </Pressable>

            {selectedDate && (
              <Pressable
                onPress={handleClearDate}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor: "#FEF2F2",
                }}
              >
                <Text style={{
                  color: "#ef4444",
                  fontSize: 13,
                  fontWeight: "600",
                }}>
                  Clear Date
                </Text>
              </Pressable>
            )}
          </View>

          {/* Footer */}
          <View style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 12,
          }}>
            <Pressable
              onPress={onClose}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: Colors.border,
                backgroundColor: "white",
              }}
            >
              <Text style={{
                color: Colors.text,
                fontWeight: "600",
                fontSize: 14,
              }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}