import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { foodAreas, guideCopy, guideEvents } from "@/src/data/content";
import { AnimatedPressable, Reveal } from "@/src/components/motion";
import { colors, fonts } from "@/src/theme";
import { DestinationImage, ExternalRow, IconButton, Label } from "./explore-ui";

export default function IslandGuide({
  onClose,
  bottomInset = 0,
}: {
  onClose: () => void;
  bottomInset?: number;
}) {
  const [areaId, setAreaId] = useState(foodAreas[0]?.id);
  const [tab, setTab] = useState<"food" | "events">("food");
  const area = foodAreas.find((item) => item.id === areaId) ?? foodAreas[0];
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <IconButton name="back" label="Back to Explore" onPress={onClose} />
        <View style={{ flex: 1, gap: 3 }}>
          <Label>Food & events guide</Label>
          <Text style={styles.title}>Where we send friends to eat.</Text>
        </View>
      </View>
      <View style={styles.tabs}>
        {(["food", "events"] as const).map((item) => (
          <AnimatedPressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === item }}
            onPress={() => setTab(item)}
            style={[styles.tab, tab === item && styles.activeTab]}
          >
            <Text
              style={[styles.tabText, tab === item && { color: colors.text }]}
            >
              {item === "food" ? "Food by area" : "Dates to know"}
            </Text>
          </AnimatedPressable>
        ))}
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "food" && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.areas}
            >
              {foodAreas.map((item) => (
                <AnimatedPressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.id === areaId }}
                  onPress={() => setAreaId(item.id)}
                  style={[
                    styles.area,
                    item.id === areaId && {
                      borderColor: colors.coral,
                      backgroundColor: "#ff6f6115",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.areaText,
                      item.id === areaId && { color: colors.coral },
                    ]}
                  >
                    {item.label}
                  </Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
            {area && (
              <Reveal motionKey={area.id} style={styles.body}>
                <View style={styles.hero}>
                  <DestinationImage
                    key={area.id}
                    uri={area.image}
                    label={area.label}
                    height={195}
                  />
                  <View style={styles.heroText}>
                    <Text style={styles.heroTitle}>{area.label}</Text>
                    <Text style={styles.caption}>{area.hint}</Text>
                  </View>
                </View>
                <Text selectable style={styles.intro}>
                  {guideCopy.lead}
                </Text>
                {area.places.map((place) => (
                  <View key={place.id} style={styles.place}>
                    <Label style={{ color: colors.coral }}>
                      {place.occasion}
                    </Label>
                    <Text selectable style={styles.placeTitle}>
                      {place.name}
                    </Text>
                    <Text selectable style={styles.bodyText}>
                      {place.description}
                    </Text>
                    <ExternalRow
                      label="Open in Maps"
                      detail={area.mapLabel}
                      url={safeGuideUrl(place.mapUrl)}
                    />
                  </View>
                ))}
                <Text selectable style={styles.note}>
                  Check opening hours and book ahead directly with each venue.
                </Text>
              </Reveal>
            )}
          </>
        )}
        {tab === "events" && (
          <View style={styles.body}>
            <Text selectable style={styles.intro}>
              {guideCopy.eventLead}
            </Text>
            {guideEvents.map((event) => (
              <View key={event.id} style={styles.place}>
                <Label style={{ color: colors.coral }}>{event.when}</Label>
                <Text selectable style={styles.placeTitle}>
                  {event.name}
                </Text>
                <Text style={styles.caption}>{event.where}</Text>
                <Text selectable style={styles.bodyText}>
                  {event.description}
                </Text>
                {event.url && (
                  <ExternalRow
                    label="Check event details"
                    url={safeGuideUrl(event.url)}
                  />
                )}
              </View>
            ))}
            <Text selectable style={styles.note}>
              Annual dates can change. Confirm the current programme before
              planning around an event.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
function safeGuideUrl(value: string): string | null {
  try {
    const url = new URL(value, "https://yournexttriptoparadise.com");
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", gap: 12, alignItems: "center", padding: 16 },
  title: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 19,
    lineHeight: 25,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    minHeight: 44,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  activeTab: { backgroundColor: colors.surfaceRaised },
  tabText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  areas: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  area: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 12,
    justifyContent: "center",
  },
  areaText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  body: { padding: 16, gap: 18 },
  hero: { borderRadius: 18, overflow: "hidden" },
  heroText: { position: "absolute", bottom: 16, left: 16, right: 16, gap: 4 },
  heroTitle: { fontFamily: fonts.sansBold, fontSize: 23, color: colors.text },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
  },
  intro: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 25,
    color: colors.textSecondary,
  },
  place: {
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    gap: 10,
  },
  placeTitle: {
    fontFamily: fonts.sansBold,
    color: colors.text,
    fontSize: 17,
    lineHeight: 23,
  },
  bodyText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  note: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 18,
    color: colors.muted,
  },
});
