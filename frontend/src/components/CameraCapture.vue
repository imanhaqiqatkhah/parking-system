<template>
  <div class="camera-capture">
    <v-card class="pa-4">
      <v-card-title class="text-subtitle-1 d-flex align-center">
        <v-icon start color="primary">mdi-camera</v-icon>
        عکس‌برداری از پلاک
        <v-spacer></v-spacer>

        <!-- انتخاب منبع دوربین -->
        <v-select
          v-if="devices.length > 1"
          v-model="selectedDevice"
          :items="devices"
          item-title="label"
          item-value="deviceId"
          label="دوربین"
          density="compact"
          variant="outlined"
          class="mr-2"
          style="max-width: 200px"
          @update:model-value="initCamera"
        ></v-select>

        <v-btn
          :icon="isCameraActive ? 'mdi-camera-off' : 'mdi-camera'"
          :color="isCameraActive ? 'error' : 'success'"
          @click="toggleCamera"
        ></v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Video Element -->
        <div class="camera-container">
          <video
            ref="video"
            autoplay
            playsinline
            :class="{ 'd-none': !isCameraActive || capturedImage }"
          ></video>

          <canvas ref="canvas" style="display: none"></canvas>

          <!-- Preview عکس گرفته شده -->
          <div v-if="capturedImage" class="captured-preview">
            <img :src="capturedImage" alt="Captured plate" />
            <div class="preview-overlay">
              <v-btn
                color="warning"
                icon="mdi-close"
                size="small"
                @click="capturedImage = null"
              ></v-btn>
            </div>
          </div>

          <!-- Placeholder وقتی دوربین خاموش است -->
          <div
            v-if="!isCameraActive && !capturedImage"
            class="camera-placeholder"
          >
            <v-icon size="48" color="grey-lighten-1">mdi-camera-off</v-icon>
            <div class="text-caption mt-2">دوربین غیرفعال است</div>
          </div>
        </div>

        <!-- تشخیص خودکار پلاک -->
        <v-alert
          v-if="detectedPlate"
          type="success"
          variant="tonal"
          class="mt-4"
          closable
          @click:close="detectedPlate = null"
        >
          <div class="d-flex align-center">
            <v-icon start>mdi-check-circle</v-icon>
            <span>پلاک تشخیص داده شده: </span>
            <span class="font-weight-bold mx-2">{{ detectedPlate }}</span>
            <v-chip size="small" color="success">
              {{ (confidence * 100).toFixed(0) }}%
            </v-chip>
            <v-spacer></v-spacer>
            <v-btn color="success" size="small" @click="useDetectedPlate">
              استفاده از این پلاک
            </v-btn>
          </div>
        </v-alert>

        <!-- دکمه‌های کنترل -->
        <div class="d-flex justify-center mt-4">
          <v-btn
            v-if="isCameraActive && !capturedImage"
            color="primary"
            size="large"
            :loading="capturing"
            @click="captureImage"
          >
            <v-icon start>mdi-camera</v-icon>
            عکس‌برداری
          </v-btn>

          <v-btn
            v-if="capturedImage"
            color="success"
            size="large"
            :loading="uploading"
            @click="uploadImage"
          >
            <v-icon start>mdi-upload</v-icon>
            آپلود عکس
          </v-btn>

          <v-btn
            v-if="capturedImage"
            color="warning"
            size="large"
            variant="text"
            class="ml-2"
            @click="retakeImage"
          >
            <v-icon start>mdi-camera-retake</v-icon>
            دوباره
          </v-btn>
        </div>

        <!-- خطای دوربین -->
        <v-alert v-if="cameraError" type="error" variant="tonal" class="mt-4">
          {{ cameraError }}
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import api from "../services/api";

const props = defineProps({
  type: {
    type: String,
    default: "entry", // entry or exit
  },
});

const emit = defineEmits(["upload-success", "plate-detected"]);

// Refs
const video = ref(null);
const canvas = ref(null);

// State
const isCameraActive = ref(false);
const capturing = ref(false);
const uploading = ref(false);
const capturedImage = ref(null);
const cameraError = ref(null);
const devices = ref([]);
const selectedDevice = ref("");
const detectedPlate = ref(null);
const confidence = ref(0);

// راه‌اندازی دوربین
const initCamera = async (deviceId = null) => {
  try {
    cameraError.value = null;

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment", // دوربین پشت
      },
    };

    if (deviceId) {
      constraints.video.deviceId = { exact: deviceId };
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (video.value) {
      video.value.srcObject = stream;
      await video.value.play();
      isCameraActive.value = true;
    }
  } catch (error) {
    console.error("Camera error:", error);
    cameraError.value =
      "دسترسی به دوربین امکان‌پذیر نیست. لطفاً دسترسی را بررسی کنید.";
    isCameraActive.value = false;
  }
};

// گرفتن لیست دوربین‌ها
const getDevices = async () => {
  try {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    devices.value = allDevices
      .filter((device) => device.kind === "videoinput")
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `دوربین ${index + 1}`,
      }));

    if (devices.value.length > 0 && !selectedDevice.value) {
      selectedDevice.value = devices.value[0].deviceId;
    }
  } catch (error) {
    console.error("Error getting devices:", error);
  }
};

// عکس‌برداری
const captureImage = () => {
  if (!video.value || !canvas.value) return;

  capturing.value = true;

  const context = canvas.value.getContext("2d");
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
  context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);

  capturedImage.value = canvas.value.toDataURL("image/jpeg", 0.9);

  // شبیه‌سازی تشخیص پلاک
  simulatePlateDetection();

  capturing.value = false;
};

// شبیه‌سازی تشخیص پلاک
const simulatePlateDetection = () => {
  // اینجا می‌توانید از API تشخیص پلاک استفاده کنید
  // فعلاً برای تست، یک پلاک تصادفی تولید می‌کنیم
  setTimeout(() => {
    const plates = ["12ب12345", "21د54321", "35ط98765", "77س45678", "15الف123"];
    detectedPlate.value = plates[Math.floor(Math.random() * plates.length)];
    confidence.value = 0.85 + Math.random() * 0.15;
  }, 1000);
};

// استفاده از پلاک تشخیص داده شده
const useDetectedPlate = () => {
  emit("plate-detected", detectedPlate.value);
  detectedPlate.value = null;
};

// آپلود عکس
const uploadImage = async () => {
  if (!capturedImage.value) return;

  uploading.value = true;

  try {
    // تبدیل base64 به blob
    const response = await fetch(capturedImage.value);
    const blob = await response.blob();

    // ساختن فایل
    const file = new File([blob], `plate-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    // ساختن FormData
    const formData = new FormData();
    formData.append("image", file);

    // ✅ استفاده از متد صحیح
    const endpoint = props.type === "entry" ? "/upload/entry" : "/upload/exit";

    // ارسال با axios
    const response2 = await api.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    emit("upload-success", response2.data.data);
    capturedImage.value = null;
  } catch (error) {
    console.error("Upload error:", error);
    cameraError.value =
      "خطا در آپلود عکس: " + (error.response?.data?.error || error.message);
  } finally {
    uploading.value = false;
  }
};

// دوباره عکس گرفتن
const retakeImage = () => {
  capturedImage.value = null;
  detectedPlate.value = null;
};

// خاموش/روشن کردن دوربین
const toggleCamera = async () => {
  if (isCameraActive.value) {
    // خاموش کردن دوربین
    const stream = video.value?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      video.value.srcObject = null;
    }
    isCameraActive.value = false;
    capturedImage.value = null;
    detectedPlate.value = null;
  } else {
    // روشن کردن دوربین
    await initCamera(selectedDevice.value);
  }
};

onMounted(() => {
  getDevices();
});

onUnmounted(() => {
  // پاکسازی
  const stream = video.value?.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
});
</script>

<style scoped>
.camera-container {
  position: relative;
  width: 100%;
  min-height: 300px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.camera-container video,
.camera-container img {
  width: 100%;
  height: auto;
  display: block;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #999;
}

.captured-preview {
  position: relative;
}

.preview-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>