import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { listCategories } from "@workspace/api-client-react";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { STRINGS, categoryIcon } from "@/constants/strings";
import { useColors } from "@/hooks/useColors";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = (insets.bottom || 0) + 24;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const categories = data?.categories ?? [];

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
      >
        <Text style={s.intro}>{STRINGS.categories.intro}</Text>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={STRINGS.categories.loadError} onRetry={refetch} />
        ) : categories.length === 0 ? (
          <EmptyState icon="grid" title={STRINGS.categories.empty} />
        ) : (
          categories.map((c) => (
            <View key={c.id} style={s.card}>
              <View style={s.cardTop}>
                <View style={s.iconBox}>
                  <Feather name={categoryIcon(c.key)} size={20} color={SAFFRON} />
                </View>
                <Text style={s.cardTitle}>{c.nameEn}</Text>
              </View>
              {c.descriptionEn ? (
                <Text style={s.cardDesc}>{c.descriptionEn}</Text>
              ) : null}
              <TouchableOpacity
                style={s.reportLink}
                onPress={() => router.push(`/report?categoryKey=${c.key}`)}
                activeOpacity={0.7}
              >
                <Feather name="flag" size={13} color={NAVY} />
                <Text style={s.reportLinkTxt}>{STRINGS.categories.reportCta}</Text>
                <Feather name="chevron-right" size={14} color={NAVY} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  intro: { fontSize: 13, color: "#64748b", lineHeight: 19, marginBottom: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
    shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,103,19,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "700" as const, color: "#0f172a" },
  cardDesc: { fontSize: 13, color: "#475569", lineHeight: 19, marginTop: 12 },
  reportLink: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9",
  },
  reportLinkTxt: { flex: 1, fontSize: 13, fontWeight: "600" as const, color: NAVY },
});
