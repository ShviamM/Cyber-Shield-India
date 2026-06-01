import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { checkNumber, listCategories, useCreateReport } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState, LoadingState } from "@/components/StateViews";
import { STRINGS, categoryIcon } from "@/constants/strings";
import { useColors } from "@/hooks/useColors";
import { isValidIndianPhone, phoneForApi } from "@/lib/phone";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryKey?: string; phone?: string }>();

  const [phone, setPhone] = useState(params.phone ?? "");
  const [categoryKey, setCategoryKey] = useState<string | null>(params.categoryKey ?? null);
  const [description, setDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const phoneValid = isValidIndianPhone(phone);
  const apiPhone = phoneForApi(phone);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  // Surface how many times this number was already reported.
  const reputationQuery = useQuery({
    queryKey: ["numberCheck", apiPhone],
    queryFn: () => checkNumber(apiPhone as string),
    enabled: phoneValid && apiPhone !== null,
  });

  const createReport = useCreateReport();

  const categories = categoriesQuery.data?.categories ?? [];
  const bottomPad = (insets.bottom || 0) + 24;

  async function handleSubmit() {
    if (!phoneValid) {
      setError(STRINGS.report.invalidPhone);
      return;
    }
    if (!categoryKey) {
      setError(STRINGS.report.categoryRequired);
      return;
    }
    const desc = description.trim();
    if (!desc) {
      setError(STRINGS.report.descriptionRequired);
      return;
    }
    if (desc.length < 10) {
      setError(STRINGS.report.descriptionTooShort);
      return;
    }
    setError(null);
    try {
      await createReport.mutateAsync({
        data: {
          phone: apiPhone as string,
          categoryKey,
          description: desc,
          incidentDate: incidentDate.trim() ? incidentDate.trim() : undefined,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch {
      setError(STRINGS.report.submitFailed);
    }
  }

  if (submitted) {
    return (
      <View style={[s.root, s.center, { backgroundColor: colors.background }]}>
        <View style={s.successIcon}>
          <Feather name="check-circle" size={44} color={GREEN} />
        </View>
        <Text style={s.successTitle}>{STRINGS.report.successTitle}</Text>
        <Text style={s.successMsg}>{STRINGS.report.successMsg}</Text>
        <TouchableOpacity style={s.doneBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={s.doneBtnTxt}>{STRINGS.report.done}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rep = reputationQuery.data;
  const alreadyReported = phoneValid && rep && rep.reportCount > 0;

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.intro}>{STRINGS.report.intro}</Text>

        {/* Phone */}
        <Text style={s.label}>{STRINGS.report.phoneLabel}</Text>
        <View style={s.phoneRow}>
          <View style={s.prefixBox}>
            <Text style={s.prefixTxt}>+91</Text>
          </View>
          <TextInput
            style={s.phoneInput}
            placeholder={STRINGS.report.phonePlaceholder}
            placeholderTextColor="#94a3b8"
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setError(null);
            }}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </View>
        {rep?.verifiedScam ? (
          <View style={[s.notice, s.noticeDanger]}>
            <Feather name="alert-octagon" size={14} color="#dc2626" />
            <Text style={[s.noticeTxt, { color: "#991b1b" }]}>
              {STRINGS.report.verifiedScamWarning}
            </Text>
          </View>
        ) : alreadyReported ? (
          <View style={[s.notice, s.noticeWarn]}>
            <Feather name="users" size={14} color="#ea580c" />
            <Text style={[s.noticeTxt, { color: "#9a3412" }]}>
              {STRINGS.report.alreadyReported(rep!.reportCount)}
            </Text>
          </View>
        ) : null}

        {/* Category */}
        <Text style={s.label}>{STRINGS.report.categoryLabel}</Text>
        {categoriesQuery.isLoading ? (
          <LoadingState />
        ) : categoriesQuery.isError ? (
          <ErrorState message={STRINGS.report.categoryLoadError} onRetry={categoriesQuery.refetch} />
        ) : (
          <View style={s.catGrid}>
            {categories.map((c) => {
              const active = categoryKey === c.key;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[s.catChip, active && s.catChipActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategoryKey(c.key);
                    setError(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={categoryIcon(c.key)}
                    size={14}
                    color={active ? "#fff" : NAVY}
                  />
                  <Text style={[s.catChipTxt, active && { color: "#fff" }]} numberOfLines={1}>
                    {c.nameEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Description */}
        <Text style={s.label}>{STRINGS.report.descriptionLabel}</Text>
        <TextInput
          style={s.textArea}
          placeholder={STRINGS.report.descriptionPlaceholder}
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={(v) => {
            setDescription(v);
            setError(null);
          }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Incident date (optional) */}
        <Text style={s.label}>{STRINGS.report.incidentDateLabel}</Text>
        <TextInput
          style={s.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          value={incidentDate}
          onChangeText={setIncidentDate}
          maxLength={10}
        />
        <Text style={s.hint}>{STRINGS.report.incidentDateHint}</Text>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[s.submitBtn, createReport.isPending && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={createReport.isPending}
          activeOpacity={0.85}
        >
          {createReport.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather name="flag" size={17} color="#fff" />
              <Text style={s.submitBtnTxt}>{STRINGS.report.submit}</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={s.disclaimer}>{STRINGS.report.disclaimer}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 32 },
  intro: { fontSize: 13, color: "#64748b", lineHeight: 19, marginBottom: 18 },
  label: { fontSize: 12, fontWeight: "700" as const, color: "#475569", marginBottom: 8, marginTop: 16 },
  phoneRow: { flexDirection: "row", gap: 10 },
  prefixBox: {
    height: 52, paddingHorizontal: 14, borderRadius: 14, backgroundColor: "#EBF0FA",
    alignItems: "center", justifyContent: "center",
  },
  prefixTxt: { fontSize: 15, fontWeight: "700" as const, color: NAVY },
  phoneInput: {
    flex: 1, height: 52, borderWidth: 1.5, borderColor: "rgba(11,61,145,0.12)", borderRadius: 14,
    paddingHorizontal: 14, fontSize: 16, color: "#0f172a", letterSpacing: 1, backgroundColor: "#fff",
  },
  input: {
    height: 52, borderWidth: 1.5, borderColor: "rgba(11,61,145,0.12)", borderRadius: 14,
    paddingHorizontal: 14, fontSize: 15, color: "#0f172a", backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 110, borderWidth: 1.5, borderColor: "rgba(11,61,145,0.12)", borderRadius: 14,
    padding: 14, fontSize: 15, color: "#0f172a", backgroundColor: "#fff",
  },
  hint: { fontSize: 11, color: "#94a3b8", marginTop: 8 },
  notice: {
    flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12,
    padding: 12, marginTop: 10,
  },
  noticeWarn: { backgroundColor: "#fff7ed", borderWidth: 1, borderColor: "rgba(234,88,12,0.25)" },
  noticeDanger: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "rgba(220,38,38,0.25)" },
  noticeTxt: { flex: 1, fontSize: 12, fontWeight: "600" as const, lineHeight: 17 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1.5, borderColor: "rgba(11,61,145,0.12)", maxWidth: "100%",
  },
  catChipActive: { backgroundColor: NAVY, borderColor: NAVY },
  catChipTxt: { fontSize: 12, fontWeight: "600" as const, color: "#334155", flexShrink: 1 },
  error: { fontSize: 13, color: "#dc2626", marginTop: 14, fontWeight: "600" as const },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    height: 54, borderRadius: 16, backgroundColor: SAFFRON, marginTop: 20,
    shadowColor: SAFFRON, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnTxt: { fontSize: 16, fontWeight: "700" as const, color: "#fff" },
  disclaimer: { fontSize: 11, color: "#94a3b8", lineHeight: 16, marginTop: 16, textAlign: "center" },
  successIcon: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: "rgba(19,136,8,0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  successTitle: { fontSize: 20, fontWeight: "800" as const, color: "#0f172a" },
  successMsg: { fontSize: 14, color: "#64748b", textAlign: "center", marginTop: 8, lineHeight: 20 },
  doneBtn: {
    height: 52, paddingHorizontal: 40, borderRadius: 14, backgroundColor: NAVY,
    alignItems: "center", justifyContent: "center", marginTop: 28,
  },
  doneBtnTxt: { fontSize: 16, fontWeight: "700" as const, color: "#fff" },
});
