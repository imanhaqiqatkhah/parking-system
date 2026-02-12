<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>پارکینگ</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{
          theme.global.name.value === "dark"
            ? "mdi-weather-sunny"
            : "mdi-weather-night"
        }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item to="/" prepend-icon="mdi-home">
          <v-list-item-title>صفحه اصلی</v-list-item-title>
        </v-list-item>
        <v-list-item to="/entry" prepend-icon="mdi-car">
          <v-list-item-title>ورود ماشین</v-list-item-title>
        </v-list-item>
        <v-list-item to="/exit" prepend-icon="mdi-car-off">
          <v-list-item-title>خروج ماشین</v-list-item-title>
        </v-list-item>
        <v-list-item to="/parked" prepend-icon="mdi-parking">
          <v-list-item-title>ماشین‌های پارک شده</v-list-item-title>
        </v-list-item>
        <v-list-item to="/stats" prepend-icon="mdi-chart-bar">
          <v-list-item-title>آمار</v-list-item-title>
        </v-list-item>
        <v-list-item to="/admin" prepend-icon="mdi-cog">
          <v-list-item-title>پنل ادمین</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useTheme } from "vuetify";

const drawer = ref(false);
const theme = useTheme();

const toggleTheme = () => {
  theme.global.name.value =
    theme.global.name.value === "dark" ? "light" : "dark";
};
</script>

<!-- ✅ فقط این استایل رو اضافه کن - راست‌چین اجباری -->
<style>
/* راست‌چین کردن اجباری کل پروژه */
.v-application,
.v-card,
.v-data-table,
.v-list,
.v-toolbar,
.v-container,
.v-row,
.v-col,
.v-form,
.v-input,
.v-select,
.v-text-field,
.v-btn,
.v-dialog,
.v-alert,
.v-chip,
.v-tabs,
.v-window,
.v-navigation-drawer {
  direction: rtl !important;
  text-align: right !important;
}

/* فونت فارسی */
* {
  font-family: "Vazirmatn", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}

/* اصلاح آیکون‌ها */
.v-icon {
  margin-left: 4px !important;
  margin-right: 0 !important;
}

.v-btn .v-icon {
  margin-left: 6px !important;
  margin-right: 0 !important;
}

/* اصلاح فیلدها */
.v-field__prepend-inner {
  margin-right: 0 !important;
  margin-left: 6px !important;
}

/* اصلاح جدول */
.v-data-table th,
.v-data-table td {
  text-align: right !important;
}

/* اصلاح منو */
.v-list-item__prepend {
  margin-right: 0 !important;
  margin-left: 12px !important;
}

/* اصلاح دیالوگ */
.v-card-actions {
  justify-content: flex-start !important;
}

.v-card-actions .v-btn {
  margin-left: 8px !important;
  margin-right: 0 !important;
}

/* اصلاح تب‌ها */
.v-tab {
  flex-direction: row !important;
}

.v-tab .v-icon {
  margin-left: 6px !important;
  margin-right: 0 !important;
}
</style>