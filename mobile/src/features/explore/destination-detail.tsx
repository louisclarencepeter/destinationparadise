import { useEffect, useRef } from "react";
import { Reveal } from "@/src/components/motion";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { Destination } from "@/src/data/content";
import { colors, fonts } from "@/src/theme";
import {
  DestinationImage,
  ExternalRow,
  GradientButton,
  IconButton,
  Label,
} from "./explore-ui";
import { websiteUrl } from "./explore-model";

type Props = {
  destination: Destination;
  saved: boolean;
  onSave: () => void;
  onClose: () => void;
  onPlan: () => void;
  bottomInset?: number;
  compact?: boolean;
};
export default function DestinationDetail({
  destination: d,
  saved,
  onSave,
  onClose,
  onPlan,
  bottomInset = 0,
  compact,
}: Props) {
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [d.id]);
  const experiences = [...d.excursions, ...d.safaris];
  return (
    <View style={styles.root}>
      <ScrollView
        ref={scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <DestinationImage
            key={d.id}
            uri={d.image}
            label={d.imageLabel}
            representative={d.imageIsRepresentative}
            height={compact ? 220 : 250}
          />
          <View style={styles.topButtons}>
            <IconButton
              name="back"
              label="Back to destinations"
              onPress={onClose}
            />
            <IconButton
              name="heart"
              label={
                saved ? `Remove ${d.name} from saved places` : `Save ${d.name}`
              }
              active={saved}
              onPress={onSave}
            />
          </View>
          <Reveal motionKey={d.id} style={styles.heroCopy}>
            <Label style={{ color: "#ffd9d3" }}>{d.type}</Label>
            <Text selectable style={styles.title}>
              {d.name}
            </Text>
            <Text selectable style={styles.subtitle}>
              {d.region} · {d.desc}
            </Text>
          </Reveal>
        </View>
        <Reveal motionKey={d.id} delay={55} style={styles.body}>
          <Text selectable style={styles.description}>
            {d.text}
          </Text>
          <View style={styles.tags}>
            {d.bestFor.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          {experiences.length > 0 && (
            <View style={styles.section}>
              <Label>Experiences here</Label>
              {experiences.map((experience, index) => (
                <ExternalRow
                  key={`${experience.to}-${index}`}
                  label={experience.label}
                  detail="View details & current availability"
                  url={websiteUrl(experience.to)}
                />
              ))}
            </View>
          )}
          {d.packages.length > 0 && (
            <View style={styles.section}>
              <Label>Packages that include it</Label>
              {d.packages.map((experience, index) => (
                <ExternalRow
                  key={`${experience.to}-${index}`}
                  label={experience.label}
                  url={websiteUrl(experience.to)}
                />
              ))}
            </View>
          )}
          <Text selectable style={styles.note}>
            Availability and prices are checked by our team in Zanzibar before
            anything is confirmed.
          </Text>
        </Reveal>
      </ScrollView>
      <View
        style={[styles.footer, { paddingBottom: Math.max(bottomInset, 14) }]}
      >
        <GradientButton onPress={onPlan}>
          Plan a trip around {d.name}
        </GradientButton>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topButtons: {
    position: "absolute",
    top: 12,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroCopy: { position: "absolute", bottom: 16, left: 18, right: 18, gap: 5 },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 28,
    color: colors.text,
    lineHeight: 35,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: "#ffd9d3",
    lineHeight: 18,
  },
  body: { padding: 18, gap: 18 },
  description: {
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 26,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  section: { gap: 9, marginTop: 5 },
  note: {
    fontFamily: fonts.sans,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 18,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
});
