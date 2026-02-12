import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/HomePage.vue"),
  },
  {
    path: "/entry",
    name: "Entry",
    component: () => import("../views/VehicleEntry.vue"),
  },
  {
    path: "/exit",
    name: "Exit",
    component: () => import("../views/VehicleExit.vue"),
  },
  {
    path: "/parked",
    name: "Parked",
    component: () => import("../views/ParkedVehicles.vue"),
  },
  {
    path: "/stats",
    name: "Statistics",
    component: () => import("../views/Statistics.vue"),
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("../views/AdminPanel.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
