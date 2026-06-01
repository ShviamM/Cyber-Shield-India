import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { TFunction } from "i18next";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FamilyMember, useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

const RELATIONS = ["Mother", "Father", "Spouse", "Child", "Sibling", "Other"];

// Member lastSeen is stored as a stable semantic token so it can be localized at
// render time. Unknown values (e.g. legacy persisted strings) display verbatim.
const LAST_SEEN_TOKENS: Record<string, string> = {
  "Just added": "family.justAdded",
  justNow: "family.justNow",
  oneHourAgo: "family.oneHourAgo",
};

function resolveLastSeen(lastSeen: string, t: TFunction): string {
  const key = LAST_SEEN_TOKENS[lastSeen];
  return key ? t(key) : lastSeen;
}

export default function FamilyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { familyMembers, addFamilyMember, removeFamilyMember } = useAppContext();

  const relationLabel = (rel: string) =>
    t(`family.relations.${rel.toLowerCase()}`, { defaultValue: rel });

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("Mother");

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;

  function handleAdd() {
    if (!name.trim() || !phone.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addFamilyMember({
      name: name.trim(),
      phone: phone.trim(),
      relation,
      status: "safe",
      lastSeen: "Just added",
    });
    setName("");
    setPhone("");
    setRelation("Mother");
    setShowAdd(false);
  }

  function handleDelete(m: FamilyMember) {
    if (Platform.OS === "web") {
      removeFamilyMember(m.id);
      return;
    }
    Alert.alert(t("family.removeTitle"), t("family.removeMessage", { name: m.name }), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("family.remove"),
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          removeFamilyMember(m.id);
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Navy header */}
      <View style={[s.headerBg, { paddingTop: topInset }]}>
        <View style={s.tricolor}>
          <View style={[s.triStrip, { backgroundColor: SAFFRON }]} />
          <View style={[s.triStrip, { backgroundColor: "#fff" }]} />
          <View style={[s.triStrip, { backgroundColor: GREEN }]} />
        </View>
        <View style={s.headerContent}>
          <View style={s.headerLeft}>
            <View style={s.headerIconBox}>
              <Feather name="users" size={20} color={SAFFRON} />
            </View>
            <View>
              <Text style={s.headerTitle}>{t("family.headerTitle")}</Text>
              <Text style={s.headerSub}>
                {familyMembers.length === 1
                  ? t("family.membersProtectedOne")
                  : t("family.membersProtected", { n: familyMembers.length })}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: showAdd ? "rgba(255,255,255,0.2)" : SAFFRON }]}
            onPress={() => { Haptics.selectionAsync(); setShowAdd((v) => !v); }}
            activeOpacity={0.8}
          >
            <Feather name={showAdd ? "x" : "user-plus"} size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add form */}
      {showAdd && (
        <View style={s.addForm}>
          <Text style={s.formTitle}>{t("family.addMember")}</Text>
          <TextInput
            style={s.formInput}
            placeholder={t("family.namePlaceholder")}
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={s.formInput}
            placeholder={t("family.phonePlaceholder")}
            placeholderTextColor="#94a3b8"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <View style={s.relRow}>
            {RELATIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  s.relChip,
                  relation === r
                    ? { backgroundColor: NAVY, borderColor: NAVY }
                    : { backgroundColor: "#f8f9ff", borderColor: "rgba(11,61,145,0.15)" },
                ]}
                onPress={() => { Haptics.selectionAsync(); setRelation(r); }}
                activeOpacity={0.75}
              >
                <Text style={[s.relChipTxt, { color: relation === r ? "#fff" : "#64748b" }]}>{relationLabel(r)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: name.trim() && phone.trim() ? NAVY : "#e2e8f0" }]}
            onPress={handleAdd}
            disabled={!name.trim() || !phone.trim()}
            activeOpacity={0.85}
          >
            <Feather name="shield" size={16} color="#fff" />
            <Text style={s.saveBtnTxt}>{t("family.addToShield")}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={familyMembers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: bottomPad,
          gap: 10,
          paddingTop: 14,
        }}
        showsVerticalScrollIndicator={false}
        scrollEnabled
        ListEmptyComponent={
          <View style={s.emptyState}>
            <View style={s.emptyIconBox}>
              <Feather name="users" size={32} color={SAFFRON} />
            </View>
            <Text style={s.emptyTitle}>{t("family.emptyTitle")}</Text>
            <Text style={s.emptyDesc}>
              {t("family.emptyDesc")}
            </Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => { Haptics.selectionAsync(); setShowAdd(true); }}
              activeOpacity={0.85}
            >
              <Feather name="user-plus" size={16} color="#fff" />
              <Text style={s.emptyBtnTxt}>{t("family.addFirst")}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <MemberCard
            member={item}
            relationLabel={relationLabel}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </KeyboardAvoidingView>
  );
}

function MemberCard({
  member,
  relationLabel,
  onDelete,
}: {
  member: FamilyMember;
  relationLabel: (rel: string) => string;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const isWarning = member.status === "warning";
  const statusColor = isWarning ? "#ea580c" : GREEN;
  const statusBg = isWarning ? "rgba(234,88,12,0.08)" : "rgba(19,136,8,0.08)";
  const avatarBg = isWarning ? "rgba(234,88,12,0.12)" : "rgba(19,136,8,0.1)";

  return (
    <View style={[mc.card, isWarning && mc.cardWarning]}>
      {isWarning && (
        <View style={mc.warningBanner}>
          <Feather name="alert-triangle" size={13} color="#ea580c" />
          <Text style={mc.warningTxt}>{t("family.suspiciousCallNow")}</Text>
        </View>
      )}
      <View style={mc.body}>
        <View style={[mc.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[mc.avatarTxt, { color: statusColor }]}>{member.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={mc.name}>{member.name}</Text>
          <Text style={mc.relation}>{relationLabel(member.relation)} · {member.phone}</Text>
          <Text style={mc.lastSeen}>
            {t("family.lastActivity", { value: resolveLastSeen(member.lastSeen, t) })}
          </Text>
        </View>
        <TouchableOpacity style={mc.deleteBtn} onPress={onDelete} activeOpacity={0.75}>
          <Feather name="trash-2" size={15} color="#dc2626" />
        </TouchableOpacity>
      </View>
      <View style={mc.footer}>
        <View style={[mc.statusBadge, { backgroundColor: statusBg }]}>
          <Feather name={isWarning ? "alert-triangle" : "shield"} size={12} color={statusColor} />
          <Text style={[mc.statusTxt, { color: statusColor }]}>
            {isWarning ? t("family.statusAlert") : t("family.statusSafe")}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  headerBg: { backgroundColor: NAVY, paddingBottom: 18 },
  tricolor: { flexDirection: "row", height: 3 },
  triStrip: { flex: 1 },
  headerContent: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 14, marginTop: 6,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800" as const, color: "#fff", letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  addBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center",
    shadowColor: SAFFRON, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  addForm: {
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: "#fff", borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.1)",
    padding: 16, gap: 10,
    shadowColor: NAVY, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  formTitle: { fontSize: 15, fontWeight: "700" as const, color: "#0f172a", marginBottom: 2 },
  formInput: {
    height: 48, borderRadius: 12, borderWidth: 1.5,
    borderColor: "rgba(11,61,145,0.12)",
    paddingHorizontal: 14, fontSize: 15,
    backgroundColor: "#f8f9ff", color: "#0f172a",
  },
  relRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  relChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  relChipTxt: { fontSize: 13, fontWeight: "500" as const },
  saveBtn: {
    height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 8, marginTop: 4,
    shadowColor: NAVY, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  saveBtnTxt: { fontSize: 15, fontWeight: "700" as const, color: "#fff" },
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 14 },
  emptyIconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,103,19,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" as const, color: "#0f172a" },
  emptyDesc: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 22 },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: NAVY, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 14, marginTop: 4,
    shadowColor: NAVY, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  emptyBtnTxt: { fontSize: 14, fontWeight: "700" as const, color: "#fff" },
});

const mc = StyleSheet.create({
  card: {
    backgroundColor: "#fff", borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
    overflow: "hidden",
    shadowColor: NAVY, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardWarning: {
    borderColor: "rgba(234,88,12,0.3)", borderWidth: 1.5,
  },
  warningBanner: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: "rgba(234,88,12,0.07)",
  },
  warningTxt: { fontSize: 12, fontWeight: "600" as const, color: "#ea580c" },
  body: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 18, fontWeight: "700" as const },
  name: { fontSize: 15, fontWeight: "700" as const, color: "#0f172a" },
  relation: { fontSize: 12, color: "#64748b", marginTop: 2 },
  lastSeen: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(220,38,38,0.07)",
    alignItems: "center", justifyContent: "center",
  },
  footer: { paddingHorizontal: 14, paddingBottom: 12 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignSelf: "flex-start",
  },
  statusTxt: { fontSize: 12, fontWeight: "600" as const },
});
