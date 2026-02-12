<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon start color="primary">mdi-parking</v-icon>
            <span class="text-h5">ماشین‌های پارک شده</span>
            <v-spacer></v-spacer>

            <!-- جستجو -->
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="جستجوی پلاک یا نام مالک"
              single-line
              hide-details
              density="compact"
              class="mr-4"
              style="max-width: 300px"
            ></v-text-field>

            <!-- رفرش -->
            <v-btn icon @click="loadVehicles">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- آمار خلاصه -->
            <v-row class="mb-4">
              <v-col cols="12" md="3">
                <v-card variant="outlined">
                  <v-card-text class="text-center">
                    <v-icon color="primary" size="32">mdi-car</v-icon>
                    <div class="text-h5">{{ totalVehicles }}</div>
                    <div class="text-caption">کل ماشین‌ها</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined">
                  <v-card-text class="text-center">
                    <v-icon color="success" size="32">mdi-clock-outline</v-icon>
                    <div class="text-h5">{{ avgDuration }} دقیقه</div>
                    <div class="text-caption">میانگین زمان پارک</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined">
                  <v-card-text class="text-center">
                    <v-icon color="warning" size="32">mdi-motorbike</v-icon>
                    <div class="text-h5">{{ motorcycleCount }}</div>
                    <div class="text-caption">موتورسیکلت</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined">
                  <v-card-text class="text-center">
                    <v-icon color="error" size="32">mdi-car</v-icon>
                    <div class="text-h5">{{ carCount }}</div>
                    <div class="text-caption">سواری</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- جدول ماشین‌ها -->
            <v-data-table
              :headers="headers"
              :items="filteredVehicles"
              :search="search"
              :loading="loading"
              loading-text="در حال بارگذاری..."
              no-data-text="هیچ ماشینی پارک نشده است"
              class="elevation-1"
            >
              <!-- ستون پلاک -->
              <template #item.plate_number="{ item }">
                <div class="font-weight-bold">{{ item.plate_number }}</div>
              </template>

              <!-- ستون نوع وسیله -->
              <template #item.vehicle_type="{ item }">
                <v-chip
                  :color="
                    item.vehicle_type === 'motorcycle' ? 'success' : 'primary'
                  "
                  size="small"
                >
                  <v-icon start size="16">
                    {{
                      item.vehicle_type === "motorcycle"
                        ? "mdi-motorbike"
                        : "mdi-car"
                    }}
                  </v-icon>
                  {{ item.vehicle_type === "motorcycle" ? "موتور" : "سواری" }}
                </v-chip>
              </template>

              <!-- ستون مالک -->
              <template #item.owner_name="{ item }">
                {{ item.owner_name || "نامشخص" }}
              </template>

              <!-- ستون زمان ورود -->
              <template #item.entry_time="{ item }">
                <div>{{ formatTime(item.entry_time) }}</div>
                <div class="text-caption">
                  {{ formatDuration(item.minutes_parked) }}
                </div>
              </template>

              <!-- ستون هزینه تخمینی -->
              <template #item.estimated_fee="{ item }">
                <div class="text-error font-weight-bold">
                  {{ formatPrice(calculateFee(item)) }}
                </div>
              </template>

              <!-- ستون عملیات -->
              <template #item.actions="{ item }">
                <v-btn
                  color="error"
                  size="small"
                  variant="text"
                  @click="exitVehicle(item)"
                >
                  <v-icon>mdi-exit-to-app</v-icon>
                  خروج
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog تایید خروج -->
    <v-dialog v-model="exitDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white">
          <v-icon start>mdi-alert</v-icon>
          تایید خروج ماشین
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="text-center">
            <v-icon color="error" size="64">mdi-car-off</v-icon>
            <div class="text-h6 mt-4">{{ selectedForExit?.plate_number }}</div>
            <div class="text-subtitle-1">
              {{ selectedForExit?.owner_name || "بدون نام" }}
            </div>
            <div class="text-body-1 mt-4">
              زمان ورود: {{ formatTime(selectedForExit?.entry_time) }}
            </div>
            <div class="text-h5 text-error mt-4">
              {{ formatPrice(calculateFee(selectedForExit)) }}
            </div>
            <div class="text-body-2">هزینه پارکینگ</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" :loading="exitLoading" @click="confirmExit">
            تایید خروج
          </v-btn>
          <v-btn color="grey" variant="text" @click="exitDialog = false">
            انصراف
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();
const loading = ref(false);
const exitLoading = ref(false);
const exitDialog = ref(false);
const selectedForExit = ref(null);
const vehicles = ref([]);
const search = ref("");

const headers = [
  { title: "پلاک", key: "plate_number", sortable: true },
  { title: "نوع", key: "vehicle_type", sortable: true },
  { title: "مالک", key: "owner_name", sortable: true },
  { title: "زمان ورود", key: "entry_time", sortable: true },
  { title: "هزینه تخمینی", key: "estimated_fee", sortable: true },
  { title: "عملیات", key: "actions", sortable: false },
];

const formatTime = (time) => {
  if (!time) return "";
  return new Date(time).toLocaleString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} دقیقه`;
  return `${hours} ساعت ${mins} دقیقه`;
};

const formatPrice = (price) => {
  return (
    new Intl.NumberFormat("fa-IR").format(Math.round(price || 0)) + " تومان"
  );
};

const calculateFee = (vehicle) => {
  if (!vehicle) return 0;
  const hours = vehicle.minutes_parked / 60;
  const rate = vehicle.vehicle_type === "motorcycle" ? 5000 : 10000;
  return Math.max(hours, 1) * rate;
};

const totalVehicles = computed(() => vehicles.value.length);

const motorcycleCount = computed(
  () => vehicles.value.filter((v) => v.vehicle_type === "motorcycle").length
);

const carCount = computed(
  () => vehicles.value.filter((v) => v.vehicle_type === "car").length
);

const avgDuration = computed(() => {
  if (vehicles.value.length === 0) return 0;
  const total = vehicles.value.reduce((sum, v) => sum + v.minutes_parked, 0);
  return Math.round(total / vehicles.value.length);
});

const filteredVehicles = computed(() => {
  if (!search.value) return vehicles.value;
  const query = search.value.toLowerCase();
  return vehicles.value.filter(
    (v) =>
      v.plate_number.toLowerCase().includes(query) ||
      (v.owner_name && v.owner_name.toLowerCase().includes(query))
  );
});

const loadVehicles = async () => {
  loading.value = true;
  try {
    const response = await api.getParkedVehicles();
    vehicles.value = response.data.data.map((v) => ({
      ...v,
      minutes_parked: Math.round(v.minutes_parked),
    }));
  } catch (error) {
    console.error("Error loading parked vehicles:", error);
  } finally {
    loading.value = false;
  }
};

const exitVehicle = (vehicle) => {
  selectedForExit.value = vehicle;
  exitDialog.value = true;
};

const confirmExit = async () => {
  if (!selectedForExit.value) return;

  exitLoading.value = true;
  try {
    await api.vehicleExit({
      plate_number: selectedForExit.value.plate_number,
    });
    await loadVehicles();
    exitDialog.value = false;
    selectedForExit.value = null;
  } catch (error) {
    console.error("Error exiting vehicle:", error);
    alert("خطا در ثبت خروج: " + (error.response?.data?.error || error.message));
  } finally {
    exitLoading.value = false;
  }
};

onMounted(() => {
  loadVehicles();
});
</script>