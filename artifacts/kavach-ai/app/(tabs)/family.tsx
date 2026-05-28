import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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

const RELATIONS = ["Mother", "Father", "Spouse", "Child", "Sibling", "Other"];

export default function FamilyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { familyMembers, addFamilyMember, removeFamilyMember } = useAppContext();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("Mother");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
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
    Alert.alert("Remove Member", `Remove ${m.name} from Family Shield?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
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
      <View style={[s.header, { paddingTop: topInset + 16 }]}>
        <View>
          <Text style={[s.headerTitle, { color: colors.text }]}>
            Family Shield
          </Text>
          <Text style={[s.headerSub, { color: colors.mutedForeground }]}>
            {familyMembers.length} member{familyMembers.length !== 1 ? "s" : ""}{" "}
            protected
          </Text>
        </View>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.selectionAsync();
            setShowAdd((v) => !v);
          }}
          activeOpacity={0.8}
        >
          <Feather name={showAdd ? "x" : "user-plus"} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Add member form */}
      {showAdd && (
        <View
          style={[
            s.addForm,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[s.formTitle, { color: colors.text }]}>
            Add Family Member
          </Text>
          <TextInput
            style={[s.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder="Name (e.g. Mummy)"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[s.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder="+91 98765 43210"
            placeholderTextColor={colors.mutedForeground}
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
                  {
                    backgroundColor:
                      relation === r ? colors.primary : colors.surface,
                    borderColor:
                      relation === r ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => { Haptics.selectionAsync(); setRelation(r); }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    s.relChipTxt,
                    { color: relation === r ? "#FFFFFF" : colors.mutedForeground },
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[
              s.saveBtn,
              {
                backgroundColor:
                  name.trim() && phone.trim() ? colors.primary : colors.muted,
              },
            ]}
            onPress={handleAdd}
            disabled={!name.trim() || !phone.trim()}
            activeOpacity={0.8}
          >
            <Text style={s.saveBtnTxt}>Add to Shield</Text>
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
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!familyMembers.length}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <View
              style={[
                s.emptyIcon,
                { backgroundColor: "rgba(255,103,19,0.1)" },
              ]}
            >
              <Feather name="users" size={32} color={colors.primary} />
            </View>
            <Text style={[s.emptyTitle, { color: colors.text }]}>
              No members yet
            </Text>
            <Text style={[s.emptyDesc, { color: colors.mutedForeground }]}>
              Add family members to monitor their protection status and get
              alerts when they may be at risk.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MemberCard
            member={item}
            colors={colors}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </KeyboardAvoidingView>
  );
}

function MemberCard({
  member,
  colors,
  onDelete,
}: {
  member: FamilyMember;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  onDelete: () => void;
}) {
  const isWarning = member.status === "warning";
  const statusColor = isWarning ? "#f97316" : "#22c55e";
  const statusBg = isWarning ? "rgba(249,115,22,0.12)" : "rgba(34,197,94,0.1)";
  const avatarBg = isWarning ? "rgba(249,115,22,0.15)" : "rgba(34,197,94,0.1)";

  return (
    <View
      style={[
        mc.card,
        {
          backgroundColor: colors.card,
          borderColor: isWarning
            ? "rgba(249,115,22,0.35)"
            : colors.border,
          borderWidth: isWarning ? 1.5 : 1,
        },
      ]}
    >
      {isWarning && (
        <View
          style={[
            mc.warningBanner,
            { backgroundColor: "rgba(249,115,22,0.1)" },
          ]}
        >
          <Feather name="alert-triangle" size={13} color="#f97316" />
          <Text style={mc.warningTxt}>
            Receiving a suspicious call right now!
          </Text>
        </View>
      )}
      <View style={mc.body}>
        <View style={[mc.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[mc.avatarTxt, { color: statusColor }]}>
            {member.name[0]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[mc.name, { color: colors.text }]}>{member.name}</Text>
          <Text style={[mc.relation, { color: colors.mutedForeground }]}>
            {member.relation} · {member.phone}
          </Text>
          <Text style={[mc.lastSeen, { color: colors.mutedForeground }]}>
            Last activity: {member.lastSeen}
          </Text>
        </View>
        <TouchableOpacity
          style={[mc.deleteBtn, { backgroundColor: "rgba(220,38,38,0.08)" }]}
          onPress={onDelete}
          activeOpacity={0.75}
        >
          <Feather name="trash-2" size={15} color="#dc2626" />
        </TouchableOpacity>
      </View>
      <View style={mc.footer}>
        <View style={[mc.statusBadge, { backgroundColor: statusBg }]}>
          <Feather
            name={isWarning ? "alert-triangle" : "shield"}
            size={12}
            color={statusColor}
          />
          <Text style={[mc.statusTxt, { color: statusColor }]}>
            {isWarning ? "Alert — Possible Scam Call" : "Protected & Safe"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: "700" as const },
  headerSub: { fontSize: 14, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  addForm: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginBottom: 12,
  },
  formTitle: { fontSize: 16, fontWeight: "700" as const, marginBottom: 4 },
  formInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  relRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  relChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  relChipTxt: { fontSize: 13, fontWeight: "500" as const },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  saveBtnTxt: { fontSize: 15, fontWeight: "700" as const, color: "#FFFFFF" },
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 14 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" as const },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
});

const mc = StyleSheet.create({
  card: { borderRadius: 16, overflow: "hidden" },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  warningTxt: { fontSize: 12, fontWeight: "600" as const, color: "#f97316" },
  body: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { fontSize: 18, fontWeight: "700" as const },
  name: { fontSize: 16, fontWeight: "700" as const },
  relation: { fontSize: 12, marginTop: 2 },
  lastSeen: { fontSize: 11, marginTop: 2 },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { paddingHorizontal: 14, paddingBottom: 12 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusTxt: { fontSize: 12, fontWeight: "600" as const },
});
