import { useCallback, useMemo, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  AnimatedPressable,
  Reveal,
  useReducedMotion,
} from "@/src/components/motion";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  destinations,
  foodAreas,
  guideEvents,
  type Destination,
} from "@/src/data/content";
import { useTripStore } from "@/src/state/trip-store";
import { colors, fonts } from "@/src/theme";
import DestinationMap from "@/src/components/map/destination-map";
import DestinationDetail from "./destination-detail";
import IslandGuide from "./island-guide";
import NearbyContent from "@/src/features/nearby/nearby-content";
import { useNearbyLocation } from "@/src/features/nearby/nearby-location-provider";
import { recommendNearby } from "@/src/features/nearby/nearby-model";
import { AppText, Icon } from "@/src/components/ui";
import {
  categories,
  Category,
  filterDestinations,
  websiteUrl,
} from "./explore-model";
import {
  DestinationImage,
  ExternalRow,
  ExploreIcon,
  GradientButton,
  IconButton,
  Label,
} from "./explore-ui";

export default function ExploreScreen({
  onPlan,
}: {
  onPlan: (destinationId: string) => void;
}) {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const tablet = width >= 768;
  const { savedIds, toggleSaved } = useTripStore();
  const nearby = useNearbyLocation();
  const compactHeight = height < 500;
  const [compactFiltersOpen, setCompactFiltersOpen] = useState(false);
  const [nearbyChoice, setNearbyChoice] = useState<boolean | null>(null);
  const nearbyOpen = nearbyChoice ?? nearby.enabled;
  const [region, setRegion] = useState<Destination["region"]>("Zanzibar");
  const [mode, setMode] = useState<"map" | "list">("map");
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>("stone-town");
  const [detailOpen, setDetailOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const browseFiltered = useMemo(
    () =>
      filterDestinations(destinations, {
        region,
        category,
        query,
        savedOnly,
        savedIds,
      }),
    [region, category, query, savedOnly, savedIds],
  );
  const recommendations = useMemo(() => nearby.location ? recommendNearby(destinations, nearby.location, {
    category, query, savedOnly, savedIds,
  }) : null, [nearby.location, category, query, savedOnly, savedIds]);
  const filtered = nearbyOpen ? recommendations?.destinations.map(item => item.destination) ?? [] : browseFiltered;
  const selected = destinations.find((item) => item.id === selectedId);
  const mapPins = nearbyOpen ? (detailOpen && selected ? [selected] : []) : filtered;
  const resultLabel = nearbyOpen ? 'Trips matched to your approximate location' : `${filtered.length} ${filtered.length === 1 ? "place" : "places"}${savedOnly ? " saved" : " to explore"}`;
  const fitKey = `${nearbyOpen ? filtered.map(d => d.id).join(',') : region}/${category}/${query.trim()}/${savedOnly}/${savedOnly ? savedIds.join(",") : ""}`;
  const select = useCallback((id: string) => {
    Keyboard.dismiss();
    setSelectedId(id);
    setDetailOpen(true);
  }, []);
  const clear = () => {
    setQuery("");
    setCategory("all");
    setSavedOnly(false);
  };
  const changeRegion = (next: Destination["region"]) => {
    setNearbyChoice(false);
    setRegion(next);
    setSelectedId(null);
    setDetailOpen(false);
  };
  const plan = () => {
    if (selected) {
      setDetailOpen(false);
      onPlan(selected.id);
    }
  };
  const detail = selected && (
    <DestinationDetail
      destination={selected}
      saved={savedIds.includes(selected.id)}
      onSave={() => toggleSaved(selected.id)}
      onClose={() => setDetailOpen(false)}
      onPlan={plan}
      compact={tablet}
      bottomInset={tablet ? 0 : insets.bottom}
    />
  );
  const toolbar = (
    <View style={[styles.toolbar, compactHeight && { paddingVertical: 8, gap: 8 }]}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.title}>
            {nearbyOpen ? 'Explore near you' : `Explore ${region === "Zanzibar" ? "Zanzibar" : "Tanzania"}`}
          </Text>
          {!compactHeight && <Text style={styles.subtitle}>
            {resultLabel}
            {!nearbyOpen && filtered.length > 0 && (tablet || mode === "map")
              ? " · tap a pin to begin"
              : ""}
          </Text>}
        </View>
        <IconButton
          name="heart"
          label={
            savedOnly
              ? "Show all places"
              : `Show saved places, ${savedIds.length} saved`
          }
          active={savedOnly}
          count={savedIds.length}
          onPress={() => {
            setSavedOnly((current) => !current);
            setDetailOpen(false);
          }}
        />
        {compactHeight && <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={compactFiltersOpen ? "Hide search and filters" : "Show search and filters"}
          accessibilityState={{ expanded: compactFiltersOpen }}
          aria-expanded={compactFiltersOpen}
          onPress={() => setCompactFiltersOpen((open) => !open)}
          style={[styles.viewButton, { minWidth: 44, minHeight: 44 }, compactFiltersOpen && styles.activeView]}
        ><ExploreIcon name={compactFiltersOpen ? "close" : "search"} color={query || category !== "all" ? colors.coral : colors.text} /></AnimatedPressable>}
        {!tablet && !nearbyOpen && (
          <View style={styles.viewSwitcher}>
            {(["list", "map"] as const).map((view) => (
              <AnimatedPressable
                key={view}
                accessibilityRole="button"
                accessibilityLabel={`${view === "list" ? "List" : "Map"} view`}
                accessibilityState={{ selected: mode === view }}
                onPress={() => setMode(view)}
                style={[styles.viewButton, mode === view && styles.activeView]}
              >
                <ExploreIcon
                  name={view}
                  size={18}
                  color={mode === view ? colors.text : colors.muted}
                />
              </AnimatedPressable>
            ))}
          </View>
        )}
      </View>
      {(!compactHeight || compactFiltersOpen) && <View style={styles.search}>
        <ExploreIcon name="search" size={18} color={colors.muted} />
        <TextInput
          accessibilityLabel="Search places and activities"
          placeholder="Search a place or activity"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          autoCorrect={false}
          style={styles.searchInput}
        />
        {!!query && (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
            onPress={() => setQuery("")}
            style={styles.clearSearch}
          >
            <ExploreIcon name="close" size={16} />
          </AnimatedPressable>
        )}
      </View>}
      <View style={styles.regions}>
        {(["Zanzibar", "Mainland"] as const).map((item) => (
          <AnimatedPressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: item === region && !nearbyOpen }}
            aria-selected={item === region && !nearbyOpen}
            onPress={() => changeRegion(item)}
            style={[styles.region, item === region && !nearbyOpen && styles.activeRegion]}
          >
            <Text
              style={[
                styles.regionText,
                item === region && !nearbyOpen && { color: colors.text },
              ]}
            >
              {item}
              <Text
                style={{ color: item === region && !nearbyOpen ? "#ffd9d3" : colors.muted }}
              >
                {" "}
                {
                  destinations.filter(
                    (destination) => destination.region === item,
                  ).length
                }
              </Text>
            </Text>
          </AnimatedPressable>
        ))}
        <AnimatedPressable accessibilityRole="tab" accessibilityLabel="Near me" accessibilityState={{ selected: nearbyOpen }} aria-selected={nearbyOpen} onPress={() => { setNearbyChoice(true); setDetailOpen(false); }} style={[styles.region, nearbyOpen && styles.activeRegion]}>
          <Text style={[styles.regionText, nearbyOpen && { color: colors.coral }]}>Near me</Text>
        </AnimatedPressable>
      </View>
      {(!compactHeight || compactFiltersOpen) && <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        style={styles.categoryScroll}
      >
        {categories.map((item) => (
          <AnimatedPressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected: category === item.id }}
            onPress={() => {
              setCategory(item.id);
              setDetailOpen(false);
            }}
            style={[
              styles.category,
              category === item.id && styles.activeCategory,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                category === item.id && { color: colors.coral },
              ]}
            >
              {item.label}
            </Text>
          </AnimatedPressable>
        ))}
      </ScrollView>}
    </View>
  );
  const listing = (
    <ScrollView
      key={`${region}/${savedOnly}`}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    >
      {!tablet &&
        mode === "list" &&
        !savedOnly &&
        !query &&
        category === "all" && (
          <View style={styles.listHero}>
            <DestinationImage
              uri="https://yournexttriptoparadise.com/assets/images/home/stone-town-waterfront.webp"
              label="Stone Town waterfront"
              height={170}
            />
            <View style={styles.listHeroCopy}>
              <Label style={{ color: "#ffd9d3" }}>
                Explore Zanzibar & Tanzania
              </Label>
              <Text style={styles.heroTitle}>
                Start with the place, or the kind of trip.
              </Text>
            </View>
          </View>
        )}
      <View style={styles.listHeading}>
        <Text style={styles.scriptTitle}>
          {savedOnly ? "Your saved places" : "Where to go"}
        </Text>
        <Text style={styles.count}>
          {filtered.length} {filtered.length === 1 ? "place" : "places"}
        </Text>
      </View>
      {!filtered.length && (
        <EmptyResults onClear={clear} savedOnly={savedOnly} />
      )}
      {filtered.map((destination) =>
        tablet ? (
          <DestinationRow
            key={destination.id}
            destination={destination}
            selected={destination.id === selectedId}
            onPress={() => select(destination.id)}
          />
        ) : (
          <DestinationCard
            key={destination.id}
            destination={destination}
            saved={savedIds.includes(destination.id)}
            onSave={() => toggleSaved(destination.id)}
            onPress={() => select(destination.id)}
          />
        ),
      )}
      {!tablet &&
        !savedOnly &&
        !query &&
        category === "all" &&
        region === "Zanzibar" && (
          <View style={{ gap: 12, marginTop: 8 }}>
            <Text style={styles.scriptTitle}>Day trips we run</Text>
            <Text style={styles.subtitle}>
              Discover the experiences. Current prices are confirmed with your
              quote.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {[
                { id: "fumba", path: "/excursions/safari-blue" },
                { id: "nungwi", path: "/excursions/mnemba" },
                { id: "stone-town", path: "/excursions/spice-tour" },
              ].map((trip) => {
                const destination = destinations.find(
                  (item) => item.id === trip.id,
                )!;
                const experience = destination.excursions.find(
                  (item) => item.to === trip.path,
                );
                return experience ? (
                  <View
                    key={trip.id}
                    style={{
                      width: 235,
                      overflow: "hidden",
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <DestinationImage
                      uri={destination.image}
                      label={destination.imageLabel}
                      height={120}
                    />
                    <View style={{ padding: 12, gap: 12 }}>
                      <Text style={styles.rowTitle}>{experience.label}</Text>
                      <Text style={styles.rowCaption}>{destination.name}</Text>
                      <ExternalRow
                        label="View day trip"
                        url={websiteUrl(experience.to)}
                      />
                    </View>
                  </View>
                ) : null;
              })}
            </ScrollView>
          </View>
        )}
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel="Open island food and events guide"
        onPress={() => setGuideOpen(true)}
        style={styles.guideCard}
      >
        {!tablet && (
          <DestinationImage
            uri="https://yournexttriptoparadise.com/assets/images/excursions/trips/forodhani-street-food-600w.webp"
            label="Island food and events guide"
            height={130}
          />
        )}
        <View style={styles.guideCopy}>
          <Label style={{ color: colors.coral }}>
            Our island food & events guide
          </Label>
          <Text style={styles.guideTitle}>Where we send friends to eat.</Text>
          <View style={styles.inline}>
            <Text style={styles.guideCaption}>
              {foodAreas.length} areas ·{" "}
              {foodAreas.reduce((total, area) => total + area.places.length, 0)}{" "}
              places · {guideEvents.length} dates
            </Text>
            <ExploreIcon name="arrow" color={colors.coral} size={18} />
          </View>
        </View>
      </AnimatedPressable>
      <Text selectable style={styles.footerCopy}>
        Destination Paradise · Zanzibar, Tanzania{"\n"}
        yournexttriptoparadise.com
      </Text>
    </ScrollView>
  );
  const nearbyListing = <NearbyContent recommendations={recommendations} onSelect={select} onPlan={onPlan} onBrowse={(next) => { clear(); changeRegion(next); }} onClearFilters={clear} />;
  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {tablet ? (
        <View style={styles.tablet}>
          <View
            style={[
              styles.sidebar,
              { width: Math.min(400, Math.max(330, width * 0.34)) },
            ]}
          >
            {detailOpen && detail ? (
              detail
            ) : (
              <>
                {toolbar}
                {nearbyOpen ? nearbyListing : listing}
              </>
            )}
          </View>
          <View style={styles.mapArea}>
            {nearbyOpen && !detailOpen ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 20, backgroundColor: colors.background }}>
              <Icon name="compass" size={88} color={colors.coral} />
              <AppText variant="title" style={{ textAlign: 'center', maxWidth: 420 }}>Your next adventure is closer.</AppText>
              <AppText color={colors.textSecondary} style={{ textAlign: 'center', maxWidth: 350 }}>Choose a suggested destination to explore it on the map, or start planning a trip.</AppText>
            </View> : <>
            <DestinationMap
              pins={mapPins}
              selectedId={selectedId}
              fitKey={nearbyOpen ? `nearby-selected/${selectedId}` : fitKey}
              onSelect={select}
              statusInset={75}
            />
            <View style={styles.mapHeading}>
              <Text style={styles.mapHeadingTitle}>
                {nearbyOpen ? 'Places for your next trip.' : region === "Zanzibar"
                  ? "The island, at your pace."
                  : "Beyond the island."}
              </Text>
              <Text style={styles.mapHeadingCaption}>
                Drag to explore · pinch to zoom
              </Text>
            </View>
            {!filtered.length && !nearbyOpen && (
              <View style={styles.emptyMap}>
                <EmptyResults onClear={clear} savedOnly={savedOnly} />
              </View>
            )}
            </>}
          </View>
        </View>
      ) : (
        <>
          {toolbar}
          {nearbyOpen ? nearbyListing : mode === "map" ? (
            <View style={styles.mapArea}>
              <DestinationMap
                pins={filtered}
                selectedId={selectedId}
                fitKey={fitKey}
                onSelect={select}
              />
              {!filtered.length && (
                <View style={styles.emptyMap}>
                  <EmptyResults onClear={clear} savedOnly={savedOnly} />
                </View>
              )}
              <View style={styles.mapFooter}>
                <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel="Browse destination list"
                  onPress={() => setMode("list")}
                  style={styles.browse}
                >
                  <ExploreIcon
                    name="list"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.browseText}>
                    Browse {filtered.length}{" "}
                    {filtered.length === 1 ? "place" : "places"}
                  </Text>
                </AnimatedPressable>
              </View>
            </View>
          ) : (
            listing
          )}
        </>
      )}
      {!tablet && (
        <Modal
          visible={detailOpen && !!selected}
          transparent
          animationType={reducedMotion ? "none" : "slide"}
          onRequestClose={() => setDetailOpen(false)}
          supportedOrientations={[
            "portrait",
            "portrait-upside-down",
            "landscape",
            "landscape-left",
            "landscape-right",
          ]}
          statusBarTranslucent
        >
          <View style={styles.modal}>
            <Pressable
              style={StyleSheet.absoluteFill}
              accessibilityLabel="Close destination details"
              accessibilityRole="button"
              onPress={() => setDetailOpen(false)}
            />
            <View
              accessibilityViewIsModal
              style={[
                styles.sheet,
                {
                  height: Math.min(height * 0.88, height - insets.top - 12),
                  paddingLeft: insets.left,
                  paddingRight: insets.right,
                },
              ]}
            >
              <View style={styles.grabber} />
              {detail}
            </View>
          </View>
        </Modal>
      )}
      <Modal
        visible={guideOpen}
        transparent
        animationType={reducedMotion ? "none" : "slide"}
        onRequestClose={() => setGuideOpen(false)}
        supportedOrientations={[
          "portrait",
          "portrait-upside-down",
          "landscape",
          "landscape-left",
          "landscape-right",
        ]}
        statusBarTranslucent
      >
        <View
          style={[
            styles.modal,
            tablet && { justifyContent: "center", padding: 25 },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Close food and events guide"
            accessibilityRole="button"
            onPress={() => setGuideOpen(false)}
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                width: tablet ? Math.min(720, width - 80) : "100%",
                borderRadius: tablet ? 26 : undefined,
                height: tablet ? height - 80 : height - insets.top - 12,
              },
            ]}
          >
            <View style={styles.grabber} />
            <IslandGuide
              onClose={() => setGuideOpen(false)}
              bottomInset={insets.bottom}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DestinationRow({
  destination: d,
  selected,
  onPress,
}: {
  destination: Destination;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${d.number}. ${d.name}, ${d.desc}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.destinationRow,
        selected && { backgroundColor: "#ff6f6117", borderColor: "#ff6f6140" },
        pressed && { opacity: 0.75 },
      ]}
    >
      <View
        style={[
          styles.pinNumber,
          selected && { backgroundColor: colors.coral },
        ]}
      >
        <Text style={[styles.pinText, selected && { color: "#fff" }]}>
          {d.number}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={[styles.rowTitle, selected && { color: colors.coral }]}>
          {d.name}
        </Text>
        <Text style={styles.rowCaption}>{d.desc}</Text>
      </View>
      <ExploreIcon name="arrow" size={16} color={colors.muted} />
    </AnimatedPressable>
  );
}
function DestinationCard({
  destination: d,
  saved,
  onSave,
  onPress,
}: {
  destination: Destination;
  saved: boolean;
  onSave: () => void;
  onPress: () => void;
}) {
  return (
    <Reveal motionKey={d.id} style={styles.card}>
      <View style={styles.cardAccent} />
      <View>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={`Explore ${d.name}`}
          onPress={onPress}
        >
          <DestinationImage
            uri={d.image}
            label={d.imageLabel}
            representative={d.imageIsRepresentative}
            height={190}
          />
          <View style={styles.cardTitle}>
            <Text style={styles.cardName}>{d.name}</Text>
            <Text style={styles.cardDescription}>{d.desc}</Text>
          </View>
        </AnimatedPressable>
        <View style={styles.cardTop}>
          <View style={styles.typePill}>
            <Text style={styles.typeText}>{d.type}</Text>
          </View>
          <IconButton
            name="heart"
            label={
              saved ? `Remove ${d.name} from saved places` : `Save ${d.name}`
            }
            active={saved}
            onPress={onSave}
          />
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text selectable style={styles.cardText}>
          {d.text}
        </Text>
        <View style={styles.tags}>
          {d.bestFor.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <GradientButton onPress={onPress}>Explore {d.name}</GradientButton>
      </View>
    </Reveal>
  );
}
function EmptyResults({
  onClear,
  savedOnly,
}: {
  onClear: () => void;
  savedOnly: boolean;
}) {
  return (
    <View style={styles.empty} accessibilityLiveRegion="polite">
      <Text style={styles.emptyTitle}>
        {savedOnly
          ? "No saved places in this view."
          : "Nothing matches that yet."}
      </Text>
      <Text style={styles.emptyText}>
        {savedOnly
          ? "Save places with the heart, or switch regions to find your favourites."
          : "Try another region or clear your search and category."}
      </Text>
      <AnimatedPressable
        accessibilityRole="button"
        onPress={onClear}
        style={styles.clearFilters}
      >
        <Text style={styles.clearFiltersText}>Clear filters</Text>
      </AnimatedPressable>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  tablet: { flex: 1, flexDirection: "row" },
  sidebar: { borderRightWidth: 1, borderColor: colors.border },
  toolbar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10,
    backgroundColor: colors.background,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.text },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.muted,
    lineHeight: 16,
  },
  viewSwitcher: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    gap: 2,
  },
  viewButton: {
    height: 38,
    width: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  activeView: { backgroundColor: colors.surfaceRaised },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontFamily: fonts.sans,
    color: colors.text,
    fontSize: 12,
  },
  clearSearch: {
    width: 30,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  regions: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  region: {
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9,
  },
  activeRegion: { backgroundColor: colors.surfaceRaised },
  regionText: {
    fontFamily: fonts.sansMedium,
    color: colors.muted,
    fontSize: 12,
  },
  categoryScroll: { marginHorizontal: -16, flexGrow: 0 },
  categories: { gap: 8, paddingHorizontal: 16 },
  category: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  activeCategory: { backgroundColor: "#ff6f6115", borderColor: "#ff6f6159" },
  categoryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  mapArea: { flex: 1, position: "relative", minHeight: 160 },
  mapHeading: { position: "absolute", top: 24, left: 24, right: 86 },
  mapHeadingTitle: { fontFamily: fonts.serif, fontSize: 25, color: "#fff" },
  mapHeadingCaption: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 7,
  },
  mapFooter: {
    position: "absolute",
    left: 16,
    right: 80,
    bottom: 36,
    alignItems: "flex-start",
  },
  browse: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: "#071c2bf5",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  browseText: {
    color: colors.textSecondary,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
  },
  listContent: { padding: 16, paddingTop: 4, gap: 14, paddingBottom: 24 },
  listHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  scriptTitle: { color: colors.text, fontFamily: fonts.script, fontSize: 25 },
  count: { fontFamily: fonts.sans, fontSize: 10, color: colors.muted },
  listHero: { borderRadius: 20, overflow: "hidden" },
  listHeroCopy: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    gap: 6,
  },
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
  },
  destinationRow: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 75,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pinNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  pinText: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.coral },
  rowTitle: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.text },
  rowCaption: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  cardAccent: { height: 4, backgroundColor: colors.coral },
  cardTop: {
    position: "absolute",
    top: 9,
    left: 12,
    right: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  typePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#ffffffd9",
    maxWidth: "75%",
  },
  typeText: {
    fontFamily: fonts.sansBold,
    color: colors.navy,
    textTransform: "uppercase",
    fontSize: 9,
    letterSpacing: 1,
  },
  cardTitle: { position: "absolute", bottom: 12, left: 16, right: 16, gap: 5 },
  cardName: { fontFamily: fonts.sansBold, color: colors.text, fontSize: 21 },
  cardDescription: { fontFamily: fonts.sans, color: "#ffd9d3", fontSize: 12 },
  cardBody: { padding: 15, gap: 12 },
  cardText: {
    fontFamily: fonts.serif,
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textSecondary,
  },
  guideCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  guideCopy: { padding: 15, gap: 8 },
  guideTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 25,
    color: colors.text,
  },
  inline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  guideCaption: { fontFamily: fonts.sans, color: colors.muted, fontSize: 10 },
  footerCopy: {
    fontFamily: fonts.sans,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 19,
    marginTop: 14,
  },
  emptyMap: { position: "absolute", left: 18, right: 18, top: "25%" },
  empty: {
    padding: 22,
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    backgroundColor: "#0b2839f5",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.text,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 20,
    color: colors.muted,
    textAlign: "center",
  },
  clearFilters: {
    borderRadius: 10,
    minHeight: 44,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearFiltersText: {
    fontFamily: fonts.sansMedium,
    color: colors.text,
    fontSize: 12,
  },
  modal: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    overflow: "hidden",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: colors.background,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#ffffff40",
    marginVertical: 8,
    alignSelf: "center",
  },
});
