<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title class="text-h5 bg-primary text-white pa-4 rounded-t">
            <v-icon start>mdi-car</v-icon>
            ثبت ورود ماشین
          </v-card-title>

          <v-card-text class="mt-4">
            <!-- تب‌ها -->
            <v-tabs v-model="activeTab" grow class="mb-4">
              <v-tab value="manual">
                <v-icon start>mdi-form-textbox</v-icon>
                ورود دستی
              </v-tab>
              <v-tab value="camera">
                <v-icon start>mdi-camera</v-icon>
                عکس‌برداری
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <!-- فرم ورود دستی -->
              <v-window-item value="manual">
                <v-form ref="form" v-model="valid">
                  <v-text-field
                    v-model="formData.plate_number"
                    :rules="[rules.required, rules.plate]"
                    label="شماره پلاک"
                    placeholder="مثال: 12ب12345"
                    prepend-inner-icon="mdi-numeric"
                    variant="outlined"
                    clearable
                    counter
                    maxlength="20"
                    required
                  ></v-text-field>

                  <v-select
                    v-model="formData.vehicle_type"
                    :items="vehicleTypes"
                    label="نوع وسیله"
                    prepend-inner-icon="mdi-car"
                    variant="outlined"
                  ></v-select>

                  <v-text-field
                    v-model="formData.owner_name"
                    label="نام مالک (اختیاری)"
                    placeholder="مثال: ایمان حقیقت خواه"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    clearable
                  ></v-text-field>

                  <v-text-field
                    v-model="formData.phone_number"
                    :rules="[rules.phone]"
                    label="شماره تماس (اختیاری)"
                    placeholder="مثال: 09379502568"
                    prepend-inner-icon="mdi-phone"
                    variant="outlined"
                    clearable
                  ></v-text-field>
                </v-form>

                <!-- دکمه‌های ثبت -->
                <div class="d-flex justify-end mt-4">
                  <v-btn
                    color="success"
                    size="large"
                    :loading="loading"
                    :disabled="!valid || !formData.plate_number"
                    @click="submitEntry"
                  >
                    <v-icon start>mdi-check</v-icon>
                    ثبت ورود
                  </v-btn>
                  <v-btn
                    color="grey"
                    size="large"
                    variant="text"
                    class="mr-2"
                    @click="resetForm"
                  >
                    پاک کردن فرم
                  </v-btn>
                </div>
              </v-window-item>

              <!-- کامپوننت دوربین -->
              <v-window-item value="camera">
                <CameraCapture
                  type="entry"
                  @upload-success="handleUploadSuccess"
                  @plate-detected="handlePlateDetected"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ✅ دیالوگ نتیجه موفقیت - با کلید منحصر به فرد برای رفرش -->
    <v-dialog v-model="dialog" max-width="500px" persistent :key="dialogKey">
      <v-card>
        <v-card-title class="text-h5 bg-success text-white">
          <v-icon start>mdi-check-circle</v-icon>
          ورود با موفقیت ثبت شد
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="text-center">
            <v-icon color="success" size="64">mdi-check-circle</v-icon>

            <!-- نمایش اطلاعات ثبت شده - با بررسی وجود داده -->
            <div class="text-h5 mt-4">
              {{ currentResult?.vehicle?.plate_number || "" }}
            </div>
            <div class="text-subtitle-1 mt-2">
              <v-chip color="primary" class="mx-1">
                {{
                  currentResult?.vehicle?.vehicle_type === "car"
                    ? "سواری"
                    : "موتور"
                }}
              </v-chip>
            </div>

            <div class="text-body-1 mt-3">
              <div>
                <strong>مالک:</strong>
                {{ currentResult?.vehicle?.owner_name || "نامشخص" }}
              </div>
              <div>
                <strong>شماره تماس:</strong>
                {{ currentResult?.vehicle?.phone_number || "نامشخص" }}
              </div>
              <div>
                <strong>زمان ورود:</strong>
                {{ formatTime(currentResult?.parkingLog?.entry_time) }}
              </div>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="d-flex justify-center gap-2">
              <v-btn color="primary" @click="resetAndContinue">
                <v-icon start>mdi-plus</v-icon>
                ثبت ورود جدید
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
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import CameraCapture from "../components/CameraCapture.vue";

const router = useRouter();
const activeTab = ref("manual");

// ✅ فرم داده - با reactive برای کارایی بهتر
const formData = reactive({
  plate_number: "",
  vehicle_type: "car",
  owner_name: "",
  phone_number: "",
});

const valid = ref(false);
const loading = ref(false);
const dialog = ref(false);
const dialogKey = ref(0); // ✅ برای رفرش دیالوگ
const currentResult = ref(null); // ✅ نتیجه فعلی

const vehicleTypes = [
  { title: "سواری", value: "car" },
  { title: "موتور سیکلت", value: "motorcycle" },
];

const rules = {
  required: (v) => !!v || "این فیلد الزامی است",
  plate: (v) => {
    if (!v) return true;
    return (
      /^[0-9\u06F0-\u06F9]{2}[-\s]?[آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]{1,2}[-\s]?[0-9\u06F0-\u06F9]{3,5}$/.test(
        v
      ) || "فرمت پلاک صحیح نیست (مثال: 12ب12345)"
    );
  },
  phone: (v) => {
    if (!v) return true;
    return /^09[0-9]{9}$/.test(v) || "شماره تماس باید 11 رقم و با 09 شروع شود";
  },
};

const formatTime = (time) => {
  if (!time) return "";
  return new Date(time).toLocaleString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// ✅ ریست کردن کامل فرم
const resetForm = () => {
  formData.plate_number = "";
  formData.vehicle_type = "car";
  formData.owner_name = "";
  formData.phone_number = "";
  valid.value = false;
};

// ✅ ریست کردن و ادامه - بدون دیالوگ
const resetAndContinue = () => {
  dialog.value = false;
  currentResult.value = null; // پاک کردن نتیجه قبلی
  dialogKey.value = Date.now(); // تغییر کلید برای رفرش دیالوگ
  resetForm();
  activeTab.value = "manual";
};

// ✅ ثبت ورود
const submitEntry = async () => {
  if (!formData.plate_number) {
    alert("شماره پلاک الزامی است");
    return;
  }

  loading.value = true;
  try {
    // ارسال داده‌ها
    const vehicleData = {
      plate_number: formData.plate_number,
      vehicle_type: formData.vehicle_type,
      owner_name: formData.owner_name || "",
      phone_number: formData.phone_number || "",
    };

    console.log("Sending data:", vehicleData);

    const response = await api.vehicleEntry(vehicleData);

    // ✅ ذخیره نتیجه جدید
    currentResult.value = response.data.data;

    // ✅ باز کردن دیالوگ با کلید جدید
    dialogKey.value = Date.now();
    dialog.value = true;
  } catch (error) {
    console.error("Error submitting entry:", error);

    let errorMessage = "خطا در ثبت ورود";
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

// ✅ هندلرهای دوربین
const handleUploadSuccess = (data) => {
  currentResult.value = data;
  dialogKey.value = Date.now();
  dialog.value = true;
};

const handlePlateDetected = (plate) => {
  formData.plate_number = plate;
  activeTab.value = "manual";
};
</script>

<style scoped>
.v-btn {
  margin-left: 8px;
}
.gap-2 {
  gap: 8px;
}
</style>