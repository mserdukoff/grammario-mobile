import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  Pressable,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Pencil,
  Trash2,
  Shield,
  Crown,
  AlertTriangle,
} from "lucide-react-native";
import { useTheme } from "@/theme";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  getAdminUsers,
  patchAdminUser,
  deleteAdminUser,
  createAdminUser,
  type AdminUserRow,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { getAdminUserId, isAdminUser } from "@/lib/admin";
import { formatDate, pickStr, num } from "@/lib/admin-format";

type AccountFilter = "all" | "test" | "regular";

const LIMIT = 30;

export default function AdminUsersScreen() {
  const { colors } = useTheme();
  const adminId = getAdminUserId();
  const [accountFilter, setAccountFilter] = useState<AccountFilter>("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    display_name: "",
    account_type: "test" as "test" | "regular",
    daily_sentence_limit: "",
    account_expires_at: "",
    admin_notes: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getAdminUsers({
        page,
        limit: LIMIT,
        account_type:
          accountFilter === "all" ? "" : (accountFilter as "test" | "regular"),
      });
      setUsers(data.users ?? []);
      setTotal(num(data.total));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, accountFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const setFilter = (f: AccountFilter) => {
    setAccountFilter(f);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = [
        pickStr(u.display_name),
        pickStr(u.email),
        pickStr(u.id),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const startEdit = (u: AdminUserRow) => {
    setEditingId(u.id);
    setEditDraft({
      display_name: pickStr(u.display_name),
      account_type: pickStr(u.account_type) || "regular",
      daily_sentence_limit:
        u.daily_sentence_limit != null ? String(u.daily_sentence_limit) : "",
      account_expires_at: pickStr(u.account_expires_at).split("T")[0] ?? "",
      level: String(u.level ?? 1),
      xp: String(u.xp ?? 0),
      is_pro: u.is_pro ? "true" : "false",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = async (userId: string) => {
    try {
      await patchAdminUser({
        user_id: userId,
        updates: {
          display_name: editDraft.display_name || null,
          account_type: editDraft.account_type,
          daily_sentence_limit: editDraft.daily_sentence_limit
            ? Number(editDraft.daily_sentence_limit)
            : null,
          account_expires_at: editDraft.account_expires_at
            ? new Date(editDraft.account_expires_at).toISOString()
            : null,
          level: Number(editDraft.level) || 1,
          xp: Number(editDraft.xp) || 0,
          is_pro: editDraft.is_pro === "true",
        },
      });
      cancelEdit();
      await load();
    } catch (e) {
      Alert.alert(
        "Update failed",
        e instanceof ApiError ? e.message : "Unknown error"
      );
    }
  };

  const confirmDelete = (u: AdminUserRow) => {
    if (isAdminUser(u.id)) {
      Alert.alert("Cannot delete", "The admin user cannot be deleted.");
      return;
    }
    Alert.alert(
      "Delete user",
      `Remove ${pickStr(u.email)}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAdminUser(u.id);
              await load();
            } catch (e) {
              Alert.alert(
                "Delete failed",
                e instanceof ApiError ? e.message : "Unknown error"
              );
            }
          },
        },
      ]
    );
  };

  const submitCreate = async () => {
    setCreateErr(null);
    if (!createForm.email.trim() || !createForm.password.trim()) {
      setCreateErr("Email and temporary password are required.");
      return;
    }
    try {
      await createAdminUser({
        email: createForm.email.trim(),
        password: createForm.password,
        display_name: createForm.display_name.trim() || undefined,
        account_type: createForm.account_type,
        daily_sentence_limit: createForm.daily_sentence_limit
          ? Number(createForm.daily_sentence_limit)
          : undefined,
        account_expires_at: createForm.account_expires_at
          ? new Date(createForm.account_expires_at).toISOString()
          : undefined,
        admin_notes: createForm.admin_notes.trim() || undefined,
      });
      setCreateOpen(false);
      setCreateForm({
        email: "",
        password: "",
        display_name: "",
        account_type: "test",
        daily_sentence_limit: "",
        account_expires_at: "",
        admin_notes: "",
      });
      await load();
    } catch (e) {
      setCreateErr(e instanceof ApiError ? e.message : "Create failed");
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "PlusJakartaSans" as const,
    color: colors.foreground,
    backgroundColor: colors.background,
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
      >
        <AdminNav current="users" />

        <Text
          style={{
            fontFamily: "InstrumentSerif-Italic",
            fontSize: 26,
            color: colors.foreground,
          }}
        >
          Users
        </Text>
        <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
          {total.toLocaleString()} registered users
        </Text>

        {error ? (
          <Text style={{ fontFamily: "PlusJakartaSans", color: colors.destructive }}>
            {error}
          </Text>
        ) : null}

        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["all", "test", "regular"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: accountFilter === f ? colors.primary : colors.muted,
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 13,
                  color:
                    accountFilter === f ? colors.primaryForeground : colors.foreground,
                  textTransform: "capitalize",
                }}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          placeholder="Search name, email, or user id…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          style={inputStyle}
        />

        <Button
          title={createOpen ? "Cancel create" : "Create test account"}
          variant={createOpen ? "outline" : "primary"}
          onPress={() => {
            setCreateOpen(!createOpen);
            setCreateErr(null);
          }}
        />

        {createOpen ? (
          <Card>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-SemiBold",
                fontSize: 16,
                marginBottom: 12,
                color: colors.foreground,
              }}
            >
              Create test account
            </Text>
            {createErr ? (
              <Text style={{ color: colors.destructive, marginBottom: 8, fontFamily: "PlusJakartaSans" }}>
                {createErr}
              </Text>
            ) : null}
            <View style={{ gap: 10 }}>
              <TextInput
                placeholder="Email *"
                placeholderTextColor={colors.mutedForeground}
                value={createForm.email}
                onChangeText={(t) => setCreateForm((s) => ({ ...s, email: t }))}
                style={inputStyle}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                placeholder="Temporary password *"
                placeholderTextColor={colors.mutedForeground}
                value={createForm.password}
                onChangeText={(t) => setCreateForm((s) => ({ ...s, password: t }))}
                style={inputStyle}
                secureTextEntry
              />
              <TextInput
                placeholder="Display name"
                placeholderTextColor={colors.mutedForeground}
                value={createForm.display_name}
                onChangeText={(t) => setCreateForm((s) => ({ ...s, display_name: t }))}
                style={inputStyle}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["test", "regular"] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setCreateForm((s) => ({ ...s, account_type: t }))}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor:
                        createForm.account_type === t ? colors.primary : colors.muted,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans-Medium",
                        color:
                          createForm.account_type === t
                            ? colors.primaryForeground
                            : colors.foreground,
                        textTransform: "capitalize",
                      }}
                    >
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                placeholder="Daily sentence limit (optional)"
                placeholderTextColor={colors.mutedForeground}
                value={createForm.daily_sentence_limit}
                onChangeText={(t) =>
                  setCreateForm((s) => ({ ...s, daily_sentence_limit: t }))
                }
                style={inputStyle}
                keyboardType="number-pad"
              />
              <TextInput
                placeholder="Expires on (YYYY-MM-DD)"
                placeholderTextColor={colors.mutedForeground}
                value={createForm.account_expires_at}
                onChangeText={(t) =>
                  setCreateForm((s) => ({ ...s, account_expires_at: t }))
                }
                style={inputStyle}
              />
              <TextInput
                placeholder="Admin notes"
                placeholderTextColor={colors.mutedForeground}
                value={createForm.admin_notes}
                onChangeText={(t) => setCreateForm((s) => ({ ...s, admin_notes: t }))}
                style={[inputStyle, { minHeight: 72 }]}
                multiline
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Button title="Create" onPress={submitCreate} />
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setCreateOpen(false);
                    setCreateErr(null);
                  }}
                />
              </View>
            </View>
          </Card>
        ) : null}

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Button
            title="Prev"
            variant="outline"
            disabled={page <= 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          />
          <Text style={{ alignSelf: "center", fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
            Page {page} of {totalPages}
          </Text>
          <Button
            title="Next"
            variant="outline"
            disabled={page >= totalPages}
            onPress={() => setPage((p) => p + 1)}
          />
        </View>

        {filtered.map((u) => {
          const isEdit = editingId === u.id;
          const expired =
            u.account_expires_at && new Date(u.account_expires_at) < new Date();
          const idShort = u.id.slice(0, 8);
          const isRowAdmin = u.id === adminId;

          return (
            <Card
              key={u.id}
              style={{
                opacity: expired ? 0.55 : 1,
              }}
            >
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: colors.secondary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", color: colors.foreground }}>
                        {(pickStr(u.display_name) || pickStr(u.email) || "?")
                          .slice(0, 1)
                          .toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      {isEdit ? (
                        <TextInput
                          value={editDraft.display_name}
                          onChangeText={(t) =>
                            setEditDraft((d) => ({ ...d, display_name: t }))
                          }
                          style={inputStyle}
                        />
                      ) : (
                        <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", color: colors.foreground }}>
                          {pickStr(u.display_name) || pickStr(u.email).split("@")[0]}
                        </Text>
                      )}
                      <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
                        {pickStr(u.email)}
                      </Text>
                      {!isEdit && u.admin_notes ? (
                        <Text
                          style={{
                            fontFamily: "PlusJakartaSans-Italic",
                            fontSize: 12,
                            color: colors.mutedForeground,
                            marginTop: 4,
                          }}
                        >
                          {pickStr(u.admin_notes)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable onPress={() => (isEdit ? cancelEdit() : startEdit(u))}>
                      <Pencil size={20} color={colors.primary} />
                    </Pressable>
                    <Pressable onPress={() => confirmDelete(u)}>
                      <Trash2
                        size={20}
                        color={isRowAdmin ? colors.mutedForeground : colors.destructive}
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: "JetBrainsMono", fontSize: 12, color: colors.mutedForeground }}>
                    ID {idShort}…
                  </Text>
                  {isRowAdmin ? <Shield size={14} color={colors.primary} /> : null}
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>Type:</Text>
                  {isEdit ? (
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {(["test", "regular"] as const).map((t) => (
                        <Pressable
                          key={t}
                          onPress={() => setEditDraft((d) => ({ ...d, account_type: t }))}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                            backgroundColor:
                              editDraft.account_type === t ? colors.primary : colors.muted,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "PlusJakartaSans-Medium",
                              color:
                                editDraft.account_type === t
                                  ? colors.primaryForeground
                                  : colors.foreground,
                              textTransform: "capitalize",
                            }}
                          >
                            {t}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <Text style={{ textTransform: "capitalize", fontFamily: "PlusJakartaSans" }}>
                      {pickStr(u.account_type) || "regular"}
                    </Text>
                  )}
                </View>

                <View style={{ gap: 4 }}>
                  <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
                    Limit
                  </Text>
                  {isEdit ? (
                    <TextInput
                      value={editDraft.daily_sentence_limit}
                      onChangeText={(t) =>
                        setEditDraft((d) => ({ ...d, daily_sentence_limit: t }))
                      }
                      style={inputStyle}
                      keyboardType="number-pad"
                      placeholder="default"
                      placeholderTextColor={colors.mutedForeground}
                    />
                  ) : (
                    <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
                      {u.daily_sentence_limit != null ? u.daily_sentence_limit : "default"}
                    </Text>
                  )}
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
                    Expires
                  </Text>
                  {isEdit ? (
                    <TextInput
                      value={editDraft.account_expires_at}
                      onChangeText={(t) =>
                        setEditDraft((d) => ({ ...d, account_expires_at: t }))
                      }
                      style={[inputStyle, { flex: 1 }]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.mutedForeground}
                    />
                  ) : (
                    <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
                      {u.account_expires_at ? formatDate(pickStr(u.account_expires_at)) : "—"}
                    </Text>
                  )}
                  {expired ? <AlertTriangle size={16} color={colors.warning} /> : null}
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
                      Level
                    </Text>
                    {isEdit ? (
                      <TextInput
                        value={editDraft.level}
                        onChangeText={(t) => setEditDraft((d) => ({ ...d, level: t }))}
                        style={inputStyle}
                        keyboardType="number-pad"
                      />
                    ) : (
                      <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
                        Lv{num(u.level) || 1}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
                      XP
                    </Text>
                    {isEdit ? (
                      <TextInput
                        value={editDraft.xp}
                        onChangeText={(t) => setEditDraft((d) => ({ ...d, xp: t }))}
                        style={inputStyle}
                        keyboardType="number-pad"
                      />
                    ) : (
                      <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
                        {num(u.xp)}
                      </Text>
                    )}
                  </View>
                </View>

                <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
                  Analyses: {num(u.total_analyses)}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {isEdit ? (
                    <>
                      <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
                        Status (Pro)
                      </Text>
                      <Switch
                        value={editDraft.is_pro === "true"}
                        onValueChange={(v) =>
                          setEditDraft((d) => ({ ...d, is_pro: v ? "true" : "false" }))
                        }
                      />
                    </>
                  ) : (
                    <>
                      <Crown
                        size={18}
                        color={u.is_pro ? colors.warning : colors.mutedForeground}
                      />
                      <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
                        {u.is_pro ? "PRO" : "Free"}
                      </Text>
                    </>
                  )}
                </View>

                <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
                  Joined {formatDate(pickStr(u.created_at))}
                </Text>

                {isEdit ? (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Button title="Save" onPress={() => saveEdit(u.id)} />
                    <Button title="Cancel" variant="outline" onPress={cancelEdit} />
                  </View>
                ) : null}
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
