<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center bg-primary text-white">
            <v-icon start>mdi-cog</v-icon>
            <span class="text-h5">پنل مدیریت</span>
          </v-card-title>

          <v-card-text>
            <v-tabs v-model="activeTab" grow>
              <v-tab value="dashboard">
                <v-icon start>mdi-view-dashboard</v-icon>
                داشبورد
              </v-tab>
              <v-tab value="users">
                <v-icon start>mdi-account-group</v-icon>
                مدیریت کاربران
              </v-tab>
              <v-tab value="rates">
                <v-icon start>mdi-currency-usd</v-icon>
                تعرفه‌ها
              </v-tab>
              <v-tab value="settings">
                <v-icon start>mdi-cog</v-icon>
                تنظیمات
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="mt-4">
              <!-- ============ داشبورد مدیریت ============ -->
              <v-window-item value="dashboard">
                <v-row>
                  <v-col cols="12" md="3">
                    <v-card class="stat-card" elevation="2">
                      <v-card-text class="text-center">
                        <v-icon size="40" color="primary"
                          >mdi-account-group</v-icon
                        >
                        <div class="text-h4 mt-2">{{ users.length }}</div>
                        <div class="text-subtitle-2">کل کاربران</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-card class="stat-card" elevation="2">
                      <v-card-text class="text-center">
                        <v-icon size="40" color="success"
                          >mdi-account-check</v-icon
                        >
                        <div class="text-h4 mt-2">{{ activeUsersCount }}</div>
                        <div class="text-subtitle-2">کاربران فعال</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-card class="stat-card" elevation="2">
                      <v-card-text class="text-center">
                        <v-icon size="40" color="warning">mdi-car</v-icon>
                        <div class="text-h4 mt-2">
                          {{
                            settings.carRate?.toLocaleString?.("fa-IR") ||
                            "۱۰٬۰۰۰"
                          }}
                        </div>
                        <div class="text-subtitle-2">نرخ سواری (ساعتی)</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-card class="stat-card" elevation="2">
                      <v-card-text class="text-center">
                        <v-icon size="40" color="info">mdi-motorbike</v-icon>
                        <div class="text-h4 mt-2">
                          {{
                            settings.motorcycleRate?.toLocaleString?.(
                              "fa-IR"
                            ) || "۵٬۰۰۰"
                          }}
                        </div>
                        <div class="text-subtitle-2">نرخ موتور (ساعتی)</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-window-item>

              <!-- ============ مدیریت کاربران ============ -->
              <v-window-item value="users">
                <v-card>
                  <v-card-title>
                    <v-icon start>mdi-account-plus</v-icon>
                    مدیریت کاربران
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="openAddUserDialog">
                      <v-icon start>mdi-plus</v-icon>
                      کاربر جدید
                    </v-btn>
                  </v-card-title>

                  <v-card-text>
                    <v-table class="elevation-1">
                      <thead>
                        <tr>
                          <th class="text-right">نام کاربری</th>
                          <th class="text-right">نام کامل</th>
                          <th class="text-right">ایمیل</th>
                          <th class="text-right">نقش</th>
                          <th class="text-right">وضعیت</th>
                          <th class="text-right">آخرین ورود</th>
                          <th class="text-right">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="user in users" :key="user.id">
                          <td>{{ user.username }}</td>
                          <td>{{ user.full_name }}</td>
                          <td>{{ user.email }}</td>
                          <td>
                            <v-chip
                              :color="
                                user.role === 'admin' ? 'error' : 'primary'
                              "
                              size="small"
                            >
                              {{ getRoleTitle(user.role) }}
                            </v-chip>
                          </td>
                          <td>
                            <v-chip
                              :color="user.is_active ? 'success' : 'grey'"
                              size="small"
                            >
                              {{ user.is_active ? "فعال" : "غیرفعال" }}
                            </v-chip>
                          </td>
                          <td>{{ formatDate(user.last_login) }}</td>
                          <td>
                            <v-btn
                              icon
                              size="small"
                              color="primary"
                              variant="text"
                              @click="editUser(user)"
                            >
                              <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                            <v-btn
                              icon
                              size="small"
                              color="error"
                              variant="text"
                              @click="confirmDeleteUser(user)"
                            >
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                            <v-btn
                              v-if="!user.is_active"
                              icon
                              size="small"
                              color="success"
                              variant="text"
                              @click="toggleUserStatus(user)"
                            >
                              <v-icon>mdi-check</v-icon>
                            </v-btn>
                            <v-btn
                              v-else
                              icon
                              size="small"
                              color="warning"
                              variant="text"
                              @click="toggleUserStatus(user)"
                            >
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </td>
                        </tr>
                        <tr v-if="users.length === 0">
                          <td colspan="7" class="text-center py-4">
                            <v-icon size="48" color="grey-lighten-1"
                              >mdi-account-off</v-icon
                            >
                            <div class="mt-2">هیچ کاربری یافت نشد</div>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <!-- ============ تعرفه‌ها ============ -->
              <v-window-item value="rates">
                <v-card>
                  <v-card-title>
                    <v-icon start>mdi-currency-usd</v-icon>
                    مدیریت تعرفه‌ها
                  </v-card-title>

                  <v-card-text>
                    <v-form @submit.prevent="saveRates">
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model.number="settings.carRate"
                            label="نرخ سواری (تومان/ساعت)"
                            type="number"
                            suffix="تومان"
                            variant="outlined"
                            :rules="[
                              (v) => v > 0 || 'نرخ باید بیشتر از 0 باشد',
                            ]"
                            prepend-inner-icon="mdi-car"
                            required
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model.number="settings.motorcycleRate"
                            label="نرخ موتور (تومان/ساعت)"
                            type="number"
                            suffix="تومان"
                            variant="outlined"
                            :rules="[
                              (v) => v > 0 || 'نرخ باید بیشتر از 0 باشد',
                            ]"
                            prepend-inner-icon="mdi-motorbike"
                            required
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model.number="settings.minimumFee"
                            label="حداقل هزینه (تومان)"
                            type="number"
                            suffix="تومان"
                            variant="outlined"
                            :rules="[
                              (v) =>
                                v >= 0 || 'حداقل هزینه باید بیشتر از 0 باشد',
                            ]"
                            prepend-inner-icon="mdi-currency-usd"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model.number="settings.maxDailyFee"
                            label="سقف هزینه روزانه (تومان)"
                            type="number"
                            suffix="تومان"
                            variant="outlined"
                            :rules="[
                              (v) => v >= 0 || 'سقف هزینه باید بیشتر از 0 باشد',
                            ]"
                            prepend-inner-icon="mdi-cash-lock"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12">
                          <v-alert type="info" variant="tonal" class="mb-4">
                            <div class="d-flex align-center">
                              <v-icon start>mdi-information</v-icon>
                              <span
                                >تعرفه‌های جدید از لحظه ذخیره اعمال خواهند
                                شد.</span
                              >
                            </div>
                          </v-alert>
                        </v-col>

                        <v-col cols="12">
                          <v-btn
                            type="submit"
                            color="success"
                            block
                            size="large"
                            :loading="ratesLoading"
                          >
                            <v-icon start>mdi-content-save</v-icon>
                            ذخیره تعرفه‌ها
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <!-- ============ تنظیمات سیستم ============ -->
              <v-window-item value="settings">
                <v-card>
                  <v-card-title>
                    <v-icon start>mdi-cog</v-icon>
                    تنظیمات سیستم
                  </v-card-title>

                  <v-card-text>
                    <v-form @submit.prevent="saveSettings">
                      <v-switch
                        v-model="settings.autoCamera"
                        label="فعال بودن عکس‌برداری خودکار"
                        color="primary"
                        inset
                        hide-details
                        class="mb-2"
                      ></v-switch>

                      <v-switch
                        v-model="settings.notifications"
                        label="ارسال نوتیفیکیشن"
                        color="primary"
                        inset
                        hide-details
                        class="mb-2"
                      ></v-switch>

                      <v-switch
                        v-model="settings.smsNotification"
                        label="ارسال پیامک به مالک"
                        color="primary"
                        inset
                        hide-details
                        class="mb-2"
                      ></v-switch>

                      <v-divider class="my-4"></v-divider>

                      <v-select
                        v-model="settings.language"
                        :items="languages"
                        label="زبان سیستم"
                        variant="outlined"
                        prepend-inner-icon="mdi-translate"
                      ></v-select>

                      <v-btn
                        type="submit"
                        color="primary"
                        block
                        size="large"
                        :loading="settingsLoading"
                        class="mt-4"
                      >
                        <v-icon start>mdi-content-save</v-icon>
                        ذخیره تنظیمات
                      </v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- دیالوگ افزودن/ویرایش کاربر -->
    <v-dialog v-model="userDialog" max-width="500px">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon start>mdi-account</v-icon>
          {{ editingUser ? "ویرایش کاربر" : "کاربر جدید" }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="userForm" v-model="userFormValid">
            <v-text-field
              v-model="userFormData.username"
              label="نام کاربری"
              :rules="[(v) => !!v || 'نام کاربری الزامی است']"
              variant="outlined"
              class="mt-2"
              prepend-inner-icon="mdi-account"
            ></v-text-field>

            <v-text-field
              v-model="userFormData.full_name"
              label="نام کامل"
              :rules="[(v) => !!v || 'نام کامل الزامی است']"
              variant="outlined"
              prepend-inner-icon="mdi-card-account-details"
            ></v-text-field>

            <v-text-field
              v-model="userFormData.email"
              label="ایمیل"
              type="email"
              :rules="[
                (v) => !!v || 'ایمیل الزامی است',
                (v) => /.+@.+\..+/.test(v) || 'ایمیل معتبر نیست',
              ]"
              variant="outlined"
              prepend-inner-icon="mdi-email"
            ></v-text-field>

            <v-select
              v-model="userFormData.role"
              :items="roleOptions"
              item-title="title"
              item-value="value"
              label="نقش"
              variant="outlined"
              prepend-inner-icon="mdi-shield-account"
            ></v-select>

            <v-text-field
              v-if="!editingUser"
              v-model="userFormData.password"
              label="رمز عبور"
              type="password"
              :rules="[(v) => !!v || 'رمز عبور الزامی است']"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
            ></v-text-field>

            <v-switch
              v-model="userFormData.is_active"
              label="فعال"
              color="success"
              inset
              hide-details
              class="mt-2"
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="userDialog = false">
            انصراف
          </v-btn>
          <v-btn
            color="primary"
            :loading="userSaving"
            :disabled="!userFormValid"
            @click="saveUser"
          >
            ذخیره
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- دیالوگ تایید حذف -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon start>mdi-alert</v-icon>
          تایید حذف
        </v-card-title>
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="48">mdi-delete</v-icon>
          <p class="text-h6 mt-2">
            آیا از حذف کاربر "{{ deleteTarget?.full_name }}" اطمینان دارید؟
          </p>
          <p class="text-caption">این عملیات قابل بازگشت نیست.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            انصراف
          </v-btn>
          <v-btn color="error" :loading="deleteLoading" @click="deleteUser">
            حذف
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";

// ============ State ============
const activeTab = ref("dashboard");

// ============ Users Management ============
const users = ref([]);
const userDialog = ref(false);
const userForm = ref(null);
const userFormValid = ref(false);
const userSaving = ref(false);
const editingUser = ref(false);
const userFormData = reactive({
  id: null,
  username: "",
  full_name: "",
  email: "",
  role: "operator",
  is_active: true,
  password: "",
});

const deleteDialog = ref(false);
const deleteLoading = ref(false);
const deleteTarget = ref(null);

const roleOptions = [
  { title: "مدیر", value: "admin" },
  { title: "اپراتور", value: "operator" },
  { title: "ناظر", value: "viewer" },
];

// ============ Settings & Rates ============
const ratesLoading = ref(false);
const settingsLoading = ref(false);
const settings = ref({
  carRate: 10000,
  motorcycleRate: 5000,
  minimumFee: 5000,
  maxDailyFee: 50000,
  autoCamera: true,
  notifications: true,
  smsNotification: false,
  language: "fa",
});

const languages = [
  { title: "فارسی", value: "fa" },
  { title: "English", value: "en" },
  { title: "العربية", value: "ar" },
];

// ============ Computed ============
const activeUsersCount = computed(() => {
  return users.value.filter((u) => u.is_active).length;
});

// ============ Load Data from LocalStorage ============
const loadUsers = () => {
  const savedUsers = localStorage.getItem("parking_users");
  if (savedUsers) {
    users.value = JSON.parse(savedUsers);
  } else {
    // Default users
    users.value = [
      {
        id: 1,
        username: "admin",
        full_name: "مدیر سیستم",
        email: "admin@parking.com",
        role: "admin",
        is_active: true,
        last_login: new Date().toISOString(),
      },
      {
        id: 2,
        username: "operator1",
        full_name: "علی رضایی",
        email: "ali@parking.com",
        role: "operator",
        is_active: true,
        last_login: new Date().toISOString(),
      },
    ];
    saveUsers();
  }
};

const saveUsers = () => {
  localStorage.setItem("parking_users", JSON.stringify(users.value));
};

// ============ Load Settings ============
const loadSettings = () => {
  const savedSettings = localStorage.getItem("parking_settings");
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings);
  }
};

const saveSettingsToStorage = () => {
  localStorage.setItem("parking_settings", JSON.stringify(settings.value));
};

// ============ User CRUD ============
const getRoleTitle = (role) => {
  const found = roleOptions.find((r) => r.value === role);
  return found?.title || role;
};

const openAddUserDialog = () => {
  editingUser.value = false;
  Object.assign(userFormData, {
    id: null,
    username: "",
    full_name: "",
    email: "",
    role: "operator",
    is_active: true,
    password: "",
  });
  userDialog.value = true;
};

const editUser = (user) => {
  editingUser.value = true;
  Object.assign(userFormData, {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    password: "",
  });
  userDialog.value = true;
};

const saveUser = async () => {
  userSaving.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (editingUser.value) {
      const index = users.value.findIndex((u) => u.id === userFormData.id);
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          username: userFormData.username,
          full_name: userFormData.full_name,
          email: userFormData.email,
          role: userFormData.role,
          is_active: userFormData.is_active,
        };
      }
    } else {
      const newUser = {
        id:
          users.value.length > 0
            ? Math.max(...users.value.map((u) => u.id)) + 1
            : 1,
        username: userFormData.username,
        full_name: userFormData.full_name,
        email: userFormData.email,
        role: userFormData.role,
        is_active: userFormData.is_active,
        last_login: null,
      };
      users.value.push(newUser);
    }

    saveUsers();
    userDialog.value = false;
  } catch (error) {
    console.error("Error saving user:", error);
    alert("خطا در ذخیره اطلاعات کاربر");
  } finally {
    userSaving.value = false;
  }
};

const confirmDeleteUser = (user) => {
  deleteTarget.value = user;
  deleteDialog.value = true;
};

const deleteUser = async () => {
  deleteLoading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = users.value.findIndex((u) => u.id === deleteTarget.value.id);
    if (index !== -1) {
      users.value.splice(index, 1);
      saveUsers();
    }

    deleteDialog.value = false;
    deleteTarget.value = null;
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("خطا در حذف کاربر");
  } finally {
    deleteLoading.value = false;
  }
};

const toggleUserStatus = async (user) => {
  user.is_active = !user.is_active;
  saveUsers();
};

// ============ Rates Management ============
const saveRates = async () => {
  ratesLoading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    saveSettingsToStorage();
    alert("تعرفه‌ها با موفقیت ذخیره شدند");
  } catch (error) {
    console.error("Error saving rates:", error);
    alert("خطا در ذخیره تعرفه‌ها");
  } finally {
    ratesLoading.value = false;
  }
};

// ============ Settings Management ============
const saveSettings = async () => {
  settingsLoading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    saveSettingsToStorage();
    alert("تنظیمات با موفقیت ذخیره شدند");
  } catch (error) {
    console.error("Error saving settings:", error);
    alert("خطا در ذخیره تنظیمات");
  } finally {
    settingsLoading.value = false;
  }
};

// ============ Formatters ============
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============ Lifecycle ============
onMounted(() => {
  loadUsers();
  loadSettings();
});
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-5px);
}
</style>