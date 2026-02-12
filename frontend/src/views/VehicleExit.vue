<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title class="text-h5 bg-error text-white pa-4 rounded-t">
            <v-icon start>mdi-car-off</v-icon>
            ثبت خروج ماشین
          </v-card-title>

          <v-card-text class="mt-4">
            <!-- تب‌ها -->
            <v-tabs v-model="activeTab" grow class="mb-4">
              <v-tab value="list">
                <v-icon start>mdi-format-list-bulleted</v-icon>
                لیست ماشین‌های پارک شده
              </v-tab>
              <v-tab value="manual">
                <v-icon start>mdi-form-textbox</v-icon>
                جستجوی پلاک
              </v-tab>
              <v-tab value="camera">
                <v-icon start>mdi-camera</v-icon>
                عکس‌برداری
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <!-- ============ تب ۱: لیست ماشین‌های پارک شده ============ -->
              <v-window-item value="list">
                <v-card flat>
                  <v-card-title class="text-subtitle-1 d-flex align-center">
                    <v-icon start>mdi-format-list-bulleted</v-icon>
                    ماشین‌های پارک شده
                    <v-spacer></v-spacer>
                    <v-btn icon size="small" @click="loadParkedVehicles">
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                  </v-card-title>

                  <v-card-text>
                    <v-list lines="three">
                      <v-list-item
                        v-for="vehicle in parkedVehicles"
                        :key="vehicle.log_id"
                      >
                        <template v-slot:prepend>
                          <v-avatar
                            :color="
                              vehicle.vehicle_type === 'car'
                                ? 'primary'
                                : 'success'
                            "
                          >
                            <v-icon color="white">
                              {{
                                vehicle.vehicle_type === "car"
                                  ? "mdi-car"
                                  : "mdi-motorbike"
                              }}
                            </v-icon>
                          </v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-bold">
                          {{ vehicle.plate_number }}
                        </v-list-item-title>

                        <v-list-item-subtitle>
                          {{ vehicle.owner_name || "بدون نام" }} -
                          {{ formatDuration(vehicle.minutes_parked) }}
                        </v-list-item-subtitle>

                        <template v-slot:append>
                          <v-btn
                            color="error"
                            size="small"
                            @click="prepareExit(vehicle)"
                          >
                            <v-icon start>mdi-exit-to-app</v-icon>
                            خروج
                          </v-btn>
                        </template>
                      </v-list-item>

                      <v-list-item v-if="parkedVehicles.length === 0">
                        <v-list-item-title class="text-center text-grey py-4">
                          <v-icon size="48" color="grey-lighten-1"
                            >mdi-parking</v-icon
                          >
                          <div class="mt-2">هیچ ماشینی پارک نشده است</div>
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <!-- ============ تب ۲: جستجوی دستی پلاک ============ -->
              <v-window-item value="manual">
                <v-form @submit.prevent="searchByPlate">
                  <v-text-field
                    v-model="searchQuery"
                    label="شماره پلاک را وارد کنید"
                    placeholder="مثال: 12ب12345"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    clearable
                    :loading="searchLoading"
                    :rules="[rules.required]"
                  >
                    <template v-slot:append-inner>
                      <v-btn
                        color="primary"
                        :loading="searchLoading"
                        @click="searchByPlate"
                      >
                        جستجو
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-form>

                <!-- نمایش اطلاعات ماشین جستجو شده -->
                <v-card v-if="searchedVehicle" class="mt-4 bg-grey-lighten-3">
                  <v-card-title class="text-subtitle-1 bg-primary text-white">
                    اطلاعات ماشین
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="text-subtitle-2 text-grey">پلاک</div>
                        <div class="text-h6">
                          {{ searchedVehicle.plate_number }}
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="text-subtitle-2 text-grey">مالک</div>
                        <div>{{ searchedVehicle.owner_name || "نامشخص" }}</div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="text-subtitle-2 text-grey">نوع وسیله</div>
                        <v-chip
                          size="small"
                          :color="
                            searchedVehicle.vehicle_type === 'car'
                              ? 'primary'
                              : 'success'
                          "
                        >
                          {{
                            searchedVehicle.vehicle_type === "car"
                              ? "سواری"
                              : "موتور"
                          }}
                        </v-chip>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="text-subtitle-2 text-grey">شماره تماس</div>
                        <div>
                          {{ searchedVehicle.phone_number || "نامشخص" }}
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="text-subtitle-2 text-grey">زمان ورود</div>
                        <div>{{ formatTime(searchedVehicle.entry_time) }}</div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="text-subtitle-2 text-grey">
                          مدت زمان پارک
                        </div>
                        <div class="text-error font-weight-bold">
                          {{ formatDuration(searchedVehicle.minutes_parked) }}
                        </div>
                      </v-col>
                      <v-col cols="12">
                        <div class="text-subtitle-2 text-grey">
                          هزینه تخمینی
                        </div>
                        <div class="text-h5 text-primary">
                          {{ formatPrice(calculateFee(searchedVehicle)) }}
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="error"
                      :loading="loading"
                      @click="submitExit(searchedVehicle)"
                    >
                      <v-icon start>mdi-exit-to-app</v-icon>
                      ثبت خروج
                    </v-btn>
                  </v-card-actions>
                </v-card>

                <!-- پیام عدم وجود ماشین -->
                <v-alert
                  v-else-if="searchPerformed && !searchedVehicle"
                  type="warning"
                  variant="tonal"
                  class="mt-4"
                >
                  <div class="d-flex align-center">
                    <v-icon start>mdi-alert</v-icon>
                    ماشینی با این پلاک یافت نشد یا قبلاً خارج شده است
                  </div>
                </v-alert>
              </v-window-item>

              <!-- ============ تب ۳: دوربین ============ -->
              <v-window-item value="camera">
                <CameraCapture
                  type="exit"
                  @upload-success="handleUploadSuccess"
                  @plate-detected="handlePlateDetected"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ============ دیالوگ نتیجه خروج ============ -->
    <v-dialog v-model="dialog" max-width="500px" persistent :key="dialogKey">
      <v-card>
        <v-card-title class="text-h5 bg-warning text-white">
          <v-icon start>mdi-check-circle</v-icon>
          خروج با موفقیت ثبت شد
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="text-center" v-if="currentResult">
            <v-icon color="warning" size="64">mdi-car-off</v-icon>

            <div class="text-h5 mt-4">
              {{ currentResult.vehicle?.plate_number || "" }}
            </div>

            <div class="text-body-1 mt-3">
              <div>
                <strong>مالک:</strong>
                {{ currentResult.vehicle?.owner_name || "نامشخص" }}
              </div>
              <div>
                <strong>زمان ورود:</strong>
                {{ formatTime(currentResult.parkingLog?.entry_time) }}
              </div>
              <div>
                <strong>زمان خروج:</strong>
                {{ formatTime(currentResult.parkingLog?.exit_time) }}
              </div>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="text-h4 text-error">
              {{ formatPrice(currentResult.parkingLog?.fee) }}
            </div>
            <div class="text-subtitle-2">هزینه پارکینگ</div>

            <v-divider class="my-4"></v-divider>

            <div class="d-flex justify-center gap-2">
              <v-btn color="primary" @click="resetAndContinue">
                <v-icon start>mdi-plus</v-icon>
                ثبت خروج جدید
              </v-btn>
              <v-btn color="grey" variant="text" to="/" @click="dialog = false">
                <v-icon start>mdi-home</v-icon>
                صفحه اصلی
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import CameraCapture from "../components/CameraCapture.vue";

const router = useRouter();

// ============ State ============
const activeTab = ref("list");
const loading = ref(false);
const searchLoading = ref(false);
const dialog = ref(false);
const dialogKey = ref(0);
const currentResult = ref(null);

// ============ Parked Vehicles ============
const parkedVehicles = ref([]);
const parkedLoading = ref(false);

// ============ Search ============
const searchQuery = ref("");
const searchedVehicle = ref(null);
const searchPerformed = ref(false);

// ============ Rules ============
const rules = {
  required: (v) => !!v || "شماره پلاک الزامی است",
};

// ============ Utility Functions ============
const formatTime = (time) => {
  if (!time) return "";
  return new Date(time).toLocaleString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatDuration = (minutes) => {
  if (!minutes) return "0 دقیقه";
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hours === 0) return `${mins} دقیقه`;
  return `${hours} ساعت و ${mins} دقیقه`;
};

const formatPrice = (price) => {
  if (!price) return "۰ تومان";
  return new Intl.NumberFormat("fa-IR").format(Math.round(price)) + " تومان";
};

const calculateFee = (vehicle) => {
  if (!vehicle) return 0;
  const hours = Math.max(1, (vehicle.minutes_parked || 0) / 60);
  const rate = vehicle.vehicle_type === "motorcycle" ? 5000 : 10000;
  return Math.round(hours * rate);
};

// ============ Load Parked Vehicles ============
const loadParkedVehicles = async () => {
  parkedLoading.value = true;
  try {
    const response = await api.getParkedVehicles();
    parkedVehicles.value = response.data.data.map((v) => ({
      ...v,
      minutes_parked: Math.round(v.minutes_parked || 0),
    }));
    console.log("🚗 Parked vehicles loaded:", parkedVehicles.value.length);
  } catch (error) {
    console.error("Error loading parked vehicles:", error);
  } finally {
    parkedLoading.value = false;
  }
};

// ============ Search by Plate ============
const searchByPlate = async () => {
  if (!searchQuery.value) {
    alert("لطفاً شماره پلاک را وارد کنید");
    return;
  }

  searchLoading.value = true;
  searchPerformed.value = true;

  try {
    // First search in parked vehicles
    const parkedRes = await api.getParkedVehicles();
    const parkedVehicle = parkedRes.data.data.find(
      (v) => v.plate_number === searchQuery.value
    );

    if (parkedVehicle) {
      searchedVehicle.value = parkedVehicle;
    } else {
      searchedVehicle.value = null;
    }
  } catch (error) {
    console.error("Search error:", error);
    searchedVehicle.value = null;
  } finally {
    searchLoading.value = false;
  }
};

// ============ Prepare Exit ============
const prepareExit = (vehicle) => {
  searchedVehicle.value = vehicle;
  searchQuery.value = vehicle.plate_number;
  activeTab.value = "manual";
};

// ============ Submit Exit ============
const submitExit = async (vehicle) => {
  if (!vehicle) return;

  loading.value = true;
  try {
    const response = await api.vehicleExit({
      plate_number: vehicle.plate_number,
    });

    currentResult.value = response.data.data;
    dialogKey.value = Date.now();
    dialog.value = true;

    // Refresh parked vehicles list
    await loadParkedVehicles();

    // Clear search
    searchedVehicle.value = null;
    searchQuery.value = "";
    searchPerformed.value = false;
    activeTab.value = "list";
  } catch (error) {
    console.error("Error submitting exit:", error);

    let errorMessage = "خطا در ثبت خروج";
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

// ============ Handle Camera ============
const handleUploadSuccess = (data) => {
  currentResult.value = data;
  dialogKey.value = Date.now();
  dialog.value = true;
  loadParkedVehicles();
};

const handlePlateDetected = (plate) => {
  searchQuery.value = plate;
  activeTab.value = "manual";
  searchByPlate();
};

// ============ Reset ============
const resetAndContinue = () => {
  dialog.value = false;
  currentResult.value = null;
  dialogKey.value = Date.now();
  searchedVehicle.value = null;
  searchQuery.value = "";
  searchPerformed.value = false;
  activeTab.value = "list";
};

// ============ Lifecycle ============
onMounted(() => {
  loadParkedVehicles();
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.v-list-item {
  cursor: pointer;
}
.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>