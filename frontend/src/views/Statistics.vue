<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon start color="primary">mdi-chart-bar</v-icon>
            <span class="text-h5">آمار و گزارش‌های لحظه‌ای</span>
            <v-spacer></v-spacer>

            <v-chip color="success" class="ml-2">
              آخرین بروزرسانی: {{ lastUpdate }}
            </v-chip>

            <v-btn color="primary" @click="refreshAllData" :loading="loading">
              <v-icon start>mdi-refresh</v-icon>
              بروزرسانی
            </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- ============ کارت‌های آمار اصلی ============ -->
            <v-row>
              <v-col cols="12" md="3">
                <v-card class="stat-card" elevation="3">
                  <v-card-text class="text-center pa-4">
                    <v-icon size="48" color="primary">mdi-car-multiple</v-icon>
                    <div class="text-h3 font-weight-bold mt-2">
                      {{ formatNumber(stats?.total_entries || 0) }}
                    </div>
                    <div class="text-subtitle-1 text-grey">کل ورودی‌ها</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3">
                <v-card class="stat-card" elevation="3">
                  <v-card-text class="text-center pa-4">
                    <v-icon size="48" color="success"
                      >mdi-car-parking-lights</v-icon
                    >
                    <div class="text-h3 font-weight-bold mt-2">
                      {{ formatNumber(stats?.parked_count || 0) }}
                    </div>
                    <div class="text-subtitle-1 text-grey">
                      هم‌اکنون پارک شده
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3">
                <v-card class="stat-card" elevation="3">
                  <v-card-text class="text-center pa-4">
                    <v-icon size="48" color="warning">mdi-currency-usd</v-icon>
                    <div class="text-h3 font-weight-bold mt-2">
                      {{ formatPrice(stats?.today_revenue || 0) }}
                    </div>
                    <div class="text-subtitle-1 text-grey">درآمد امروز</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3">
                <v-card class="stat-card" elevation="3">
                  <v-card-text class="text-center pa-4">
                    <v-icon size="48" color="info">mdi-calendar-month</v-icon>
                    <div class="text-h3 font-weight-bold mt-2">
                      {{ formatNumber(stats?.month_entries || 0) }}
                    </div>
                    <div class="text-subtitle-1 text-grey">ورودی این ماه</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- ============ کارت‌های آمار ثانویه ============ -->
            <v-row class="mt-4">
              <v-col cols="12" md="4">
                <v-card class="stat-card" elevation="2">
                  <v-card-text class="text-center pa-3">
                    <v-icon size="40" color="error">mdi-clock-outline</v-icon>
                    <div class="text-h4 mt-1">{{ avgParkingTime }}</div>
                    <div class="text-caption text-grey">میانگین زمان پارک</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card class="stat-card" elevation="2">
                  <v-card-text class="text-center pa-3">
                    <v-icon size="40" color="primary">mdi-car</v-icon>
                    <div class="text-h4 mt-1">{{ formatNumber(carCount) }}</div>
                    <div class="text-caption text-grey">سواری امروز</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card class="stat-card" elevation="2">
                  <v-card-text class="text-center pa-3">
                    <v-icon size="40" color="success">mdi-motorbike</v-icon>
                    <div class="text-h4 mt-1">
                      {{ formatNumber(motorcycleCount) }}
                    </div>
                    <div class="text-caption text-grey">موتورسیکلت امروز</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- ============ نمودارها ============ -->
            <v-row class="mt-6">
              <!-- نمودار درآمد روزانه -->
              <v-col cols="12" md="8">
                <v-card>
                  <v-card-title class="d-flex align-center">
                    <v-icon start color="primary">mdi-chart-line</v-icon>
                    درآمد روزانه (۷ روز اخیر)
                    <v-spacer></v-spacer>
                    <v-chip size="small" color="success">
                      مجموع: {{ formatPrice(totalWeeklyRevenue) }}
                    </v-chip>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <div
                      ref="revenueChart"
                      style="height: 350px; width: 100%"
                    ></div>
                    <div
                      v-if="revenueData.length === 0"
                      class="text-center py-8 text-grey"
                    >
                      <v-icon size="48">mdi-chart-line</v-icon>
                      <div class="mt-2">داده‌ای برای نمایش وجود ندارد</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- نمودار توزیع نوع وسیله -->
              <v-col cols="12" md="4">
                <v-card style="height: 100%">
                  <v-card-title>
                    <v-icon start color="primary">mdi-chart-pie</v-icon>
                    توزیع امروز
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <div
                      ref="vehicleTypeChart"
                      style="height: 280px; width: 100%"
                    ></div>
                    <div class="d-flex justify-center mt-4">
                      <v-chip class="mx-1" color="primary" size="small">
                        سواری: {{ formatNumber(carCount) }}
                      </v-chip>
                      <v-chip class="mx-1" color="success" size="small">
                        موتور: {{ formatNumber(motorcycleCount) }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- ============ جدول آخرین فعالیت‌ها ============ -->
            <v-row class="mt-6">
              <v-col cols="12">
                <v-card>
                  <v-card-title>
                    <v-icon start>mdi-history</v-icon>
                    آخرین فعالیت‌ها
                    <v-spacer></v-spacer>
                    <v-chip size="small" color="primary">
                      {{ history.length }} رکورد
                    </v-chip>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <v-table>
                      <thead>
                        <tr>
                          <th class="text-right">پلاک</th>
                          <th class="text-right">مالک</th>
                          <th class="text-right">نوع</th>
                          <th class="text-right">ورود</th>
                          <th class="text-right">خروج</th>
                          <th class="text-right">هزینه</th>
                          <th class="text-right">وضعیت</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in recentHistory" :key="index">
                          <td class="font-weight-bold">
                            {{ item.plate_number }}
                          </td>
                          <td>{{ item.owner_name || "نامشخص" }}</td>
                          <td>
                            <v-chip
                              size="x-small"
                              :color="
                                item.vehicle_type === 'car'
                                  ? 'primary'
                                  : 'success'
                              "
                            >
                              {{
                                item.vehicle_type === "car" ? "سواری" : "موتور"
                              }}
                            </v-chip>
                          </td>
                          <td>{{ formatTime(item.entry_time) }}</td>
                          <td>{{ formatTime(item.exit_time) || "—" }}</td>
                          <td class="font-weight-bold text-error">
                            {{ formatPrice(item.fee) }}
                          </td>
                          <td>
                            <v-chip
                              size="x-small"
                              :color="
                                item.status === 'parked' ? 'primary' : 'success'
                              "
                            >
                              {{
                                item.status === "parked"
                                  ? "پارک شده"
                                  : "خارج شده"
                              }}
                            </v-chip>
                          </td>
                        </tr>
                        <tr v-if="history.length === 0">
                          <td colspan="7" class="text-center py-6 text-grey">
                            <v-icon size="40">mdi-history</v-icon>
                            <div class="mt-2">هیچ فعالیتی ثبت نشده است</div>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";
import api from "../services/api";

// ============ State ============
const stats = ref({});
const history = ref([]);
const revenueData = ref([]);
const loading = ref(false);
const lastUpdate = ref("");
let refreshInterval = null;
let revenueChartInstance = null;
let vehicleChartInstance = null;

// ============ Chart Refs ============
const revenueChart = ref(null);
const vehicleTypeChart = ref(null);

// ============ Formatters ============
const formatNumber = (num) => {
  return new Intl.NumberFormat("fa-IR").format(num || 0);
};

const formatPrice = (price) => {
  return formatNumber(price || 0) + " تومان";
};

const formatTime = (time) => {
  if (!time) return "—";
  return new Date(time).toLocaleString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fa-IR", {
    month: "2-digit",
    day: "2-digit",
  });
};

// ============ Computed ============
const motorcycleCount = computed(() => {
  if (!stats.value?.today_by_type) return 0;
  const found = stats.value.today_by_type.find((t) => t.type === "motorcycle");
  return found?.count || 0;
});

const carCount = computed(() => {
  if (!stats.value?.today_by_type) return 0;
  const found = stats.value.today_by_type.find((t) => t.type === "car");
  return found?.count || 0;
});

const avgParkingTime = computed(() => {
  const exited = history.value.filter(
    (h) => h.status === "exited" && h.exit_time
  );
  if (exited.length === 0) return "۰ دقیقه";

  const total = exited.reduce((sum, h) => {
    const entry = new Date(h.entry_time);
    const exit = new Date(h.exit_time);
    return sum + (exit - entry);
  }, 0);

  const avgMinutes = Math.round(total / (exited.length * 60000));
  if (avgMinutes < 60) return `${avgMinutes} دقیقه`;
  const hours = Math.floor(avgMinutes / 60);
  const mins = avgMinutes % 60;
  return `${hours} ساعت و ${mins} دقیقه`;
});

const totalWeeklyRevenue = computed(() => {
  return revenueData.value.reduce(
    (sum, item) => sum + (parseFloat(item.revenue) || 0),
    0
  );
});

const recentHistory = computed(() => {
  return history.value.slice(0, 10);
});

// ============ Load Data ============
const loadStats = async () => {
  try {
    const response = await api.getStats();
    if (response.data?.success) {
      stats.value = response.data.data || {};
      console.log("📊 Stats loaded:", stats.value);
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
};

const loadHistory = async () => {
  try {
    const response = await api.getHistory(50);
    if (response.data?.success) {
      history.value = response.data.data || [];
      console.log("📜 History loaded:", history.value.length);
    }
  } catch (error) {
    console.error("Error loading history:", error);
  }
};

const loadRevenueData = async () => {
  try {
    const response = await api.getDailyRevenue(7);
    if (response.data?.success) {
      revenueData.value = response.data.data || [];
      console.log("💰 Revenue data loaded:", revenueData.value);
    }
  } catch (error) {
    console.error("Error loading revenue data:", error);
    revenueData.value = [];
  }
};

const refreshAllData = async () => {
  loading.value = true;
  await Promise.all([loadStats(), loadHistory(), loadRevenueData()]);
  initCharts();
  lastUpdate.value = new Date().toLocaleTimeString("fa-IR");
  loading.value = false;
};

// ============ Charts ============
const initCharts = () => {
  // Destroy existing charts
  if (revenueChartInstance) {
    revenueChartInstance.dispose();
    revenueChartInstance = null;
  }
  if (vehicleChartInstance) {
    vehicleChartInstance.dispose();
    vehicleChartInstance = null;
  }

  // Revenue Chart
  if (revenueChart.value) {
    revenueChartInstance = echarts.init(revenueChart.value);

    // Generate last 7 days
    const dates = [];
    const revenues = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("fa-IR", {
        month: "2-digit",
        day: "2-digit",
      });
      dates.push(dateStr);

      // Find revenue for this date
      const dayData = revenueData.value.find((item) => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate.toDateString() === date.toDateString();
      });

      revenues.push(dayData ? parseFloat(dayData.revenue) : 0);
    }

    revenueChartInstance.setOption({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (value) => formatPrice(value),
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
        backgroundColor: "#fafafa",
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: {
          fontFamily: "Vazirmatn",
          fontSize: 12,
        },
        axisLine: { show: false },
      },
      yAxis: {
        type: "value",
        name: "درآمد (تومان)",
        nameLocation: "middle",
        nameGap: 50,
        nameTextStyle: {
          fontFamily: "Vazirmatn",
          fontSize: 12,
          fontWeight: "normal",
        },
        axisLabel: {
          fontFamily: "Vazirmatn",
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#e0e0e0",
          },
        },
      },
      series: [
        {
          name: "درآمد",
          type: "bar",
          data: revenues,
          itemStyle: {
            color: "#1976D2",
            borderRadius: [6, 6, 0, 0],
          },
          barWidth: "60%",
          label: {
            show: true,
            position: "top",
            formatter: (params) => formatPrice(params.value),
            fontFamily: "Vazirmatn",
            fontSize: 11,
          },
        },
      ],
    });
  }

  // Vehicle Type Distribution Chart
  if (vehicleTypeChart.value) {
    vehicleChartInstance = echarts.init(vehicleTypeChart.value);

    const carCountValue = carCount.value || 0;
    const motorCountValue = motorcycleCount.value || 0;

    vehicleChartInstance.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
        valueFormatter: (value) => formatNumber(value),
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "center",
        textStyle: {
          fontFamily: "Vazirmatn",
          fontSize: 12,
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          name: "نوع وسیله",
          type: "pie",
          radius: ["50%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "outside",
            formatter: "{b}: {d}%",
            fontFamily: "Vazirmatn",
            fontSize: 11,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "13",
              fontWeight: "bold",
            },
          },
          labelLine: {
            length: 15,
            length2: 10,
            smooth: true,
          },
          data: [
            {
              value: carCountValue,
              name: "سواری",
              itemStyle: { color: "#1976D2" },
            },
            {
              value: motorCountValue,
              name: "موتورسیکلت",
              itemStyle: { color: "#4CAF50" },
            },
          ],
        },
      ],
    });
  }
};

// ============ Auto Refresh ============
const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    refreshAllData();
  }, 30000); // 30 seconds
};

// ============ Lifecycle ============
onMounted(() => {
  refreshAllData();
  startAutoRefresh();

  // Handle window resize
  window.addEventListener("resize", () => {
    if (revenueChartInstance) revenueChartInstance.resize();
    if (vehicleChartInstance) vehicleChartInstance.resize();
  });
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  if (revenueChartInstance) {
    revenueChartInstance.dispose();
  }
  if (vehicleChartInstance) {
    vehicleChartInstance.dispose();
  }
  window.removeEventListener("resize", () => {});
});

// Watch for data changes
watch(
  [stats, revenueData, history],
  () => {
    initCharts();
  },
  { deep: true }
);
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px !important;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.v-card-title {
  font-family: "Vazirmatn", sans-serif;
  font-weight: 600;
}

.text-h3 {
  font-size: 2.5rem !important;
  font-weight: 700 !important;
}

.text-h4 {
  font-size: 2rem !important;
  font-weight: 600 !important;
}
</style>