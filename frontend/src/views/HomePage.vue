<template>
  <div class="home-page">
    <!-- Header Stats -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="text-center">
            <v-icon size="48" color="primary">mdi-car</v-icon>
            <div class="text-h4 mt-2">{{ stats.parked_count || "0" }}</div>
            <div class="text-subtitle-1">ماشین پارک شده</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="text-center">
            <v-icon size="48" color="success">mdi-car-arrow-right</v-icon>
            <div class="text-h4 mt-2">{{ stats.today_entries || "0" }}</div>
            <div class="text-subtitle-1">ورودی امروز</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="text-center">
            <v-icon size="48" color="warning">mdi-currency-usd</v-icon>
            <div class="text-h4 mt-2">
              {{ formatPrice(stats.today_revenue) }}
            </div>
            <div class="text-subtitle-1">درآمد امروز</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="bg-primary text-white my-2">
            <v-icon start>mdi-lightning-bolt</v-icon>
            اقدامات سریع
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <v-btn block color="primary" to="/entry" size="x-large">
                  <v-icon start>mdi-car</v-icon>
                  ورود ماشین
                </v-btn>
              </v-col>
              <v-col cols="6" md="3">
                <v-btn block color="error" to="/exit" size="x-large">
                  <v-icon start>mdi-car-off</v-icon>
                  خروج ماشین
                </v-btn>
              </v-col>
              <v-col cols="6" md="3">
                <v-btn block color="success" to="/parked" size="x-large">
                  <v-icon start>mdi-format-list-bulleted</v-icon>
                  لیست پارک شده‌ها
                </v-btn>
              </v-col>
              <v-col cols="6" md="3">
                <v-btn block color="info" to="/stats" size="x-large">
                  <v-icon start>mdi-chart-bar</v-icon>
                  آمار کامل
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recently Parked -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-clock-outline</v-icon>
            آخرین ماشین‌های پارک شده
            <v-spacer></v-spacer>
            <v-btn icon @click="loadData">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list lines="two">
              <v-list-item
                v-for="vehicle in parkedVehicles"
                :key="vehicle.log_id"
                :title="vehicle.plate_number"
                :subtitle="`${vehicle.owner_name || 'بدون نام'} - ${
                  vehicle.minutes_parked
                } دقیقه پیش`"
              >
                <template v-slot:prepend>
                  <v-avatar
                    :color="
                      vehicle.vehicle_type === 'motorcycle'
                        ? 'success'
                        : 'primary'
                    "
                  >
                    <v-icon color="white">
                      {{
                        vehicle.vehicle_type === "motorcycle"
                          ? "mdi-motorbike"
                          : "mdi-car"
                      }}
                    </v-icon>
                  </v-avatar>
                </template>
                <template v-slot:append>
                  <v-chip size="small" color="success">پارک شده</v-chip>
                </template>
              </v-list-item>

              <v-list-item v-if="parkedVehicles.length === 0">
                <v-list-item-title class="text-center text-grey py-4">
                  <v-icon size="48" color="grey-lighten-1">mdi-parking</v-icon>
                  <div class="mt-2">هیچ ماشینی پارک نشده است</div>
                </v-list-item-title>
              </v-list-item>
            </v-list>

            <v-btn class="mt-2" variant="text" to="/parked">
              مشاهده همه
              <v-icon end>mdi-arrow-left</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-overlay :model-value="loading" class="align-center justify-center">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import api from "../services/api";

const loading = ref(false);
const stats = ref({});
const parkedVehicles = ref([]);
let refreshInterval = null;

const formatPrice = (price) => {
  if (!price) return "۰ تومان";
  return new Intl.NumberFormat("fa-IR").format(Math.round(price)) + " تومان";
};

const loadData = async () => {
  loading.value = true;
  try {
    const [statsRes, parkedRes] = await Promise.all([
      api.getStats(),
      api.getParkedVehicles(),
    ]);

    stats.value = statsRes.data.data;
    parkedVehicles.value = parkedRes.data.data.slice(0, 5);

    console.log("📊 Stats updated:", stats.value);
    console.log("🚗 Parked vehicles:", parkedVehicles.value.length);
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
};

// ✅ بروزرسانی خودکار هر ۱۰ ثانیه
const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    loadData();
  }, 10000); // 10 seconds
};

onMounted(() => {
  loadData();
  startAutoRefresh();
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
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