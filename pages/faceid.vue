<script setup lang="ts">
import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult, ObjectDetector,type ObjectDetectorResult } from "@mediapipe/tasks-vision";
import rodriguesRotationVectorFromMatrix from "@/utils/rodrigues";
import { LucideRefreshCw } from "lucide-vue-next";
import { toast } from "~/components/ui/toast";
import { apify } from "~/utils";


definePageMeta({
    layout: "empty"
});

const route = useRoute();

const dataStore = useDataStore();
const errorStore = useErrorStore();

const { area, handle, latitude, longitude } = storeToRefs(dataStore);
const { error } = storeToRefs(errorStore);

const { encode, decode, jsonify } = useSecrets();


const isLoading = ref(true);
const process = ref<"play" | "pause">("play");

let status = false;
let faceStatus = ref<"right" | "left" | "top" | "bottom" | "upright" | "noface" | "around">("noface");
let cameraWidth = 0;
let videoWidth = 400;
let cameraHeight = 0;
let animationFrame = 0;
let lastVideoTime = -1;
let centerText = ref("Kameraga ruxsat bering");
let reload = ref(false);
let color = ref("white");

let faceLandMarker: FaceLandmarker;
let results: FaceLandmarkerResult | null = null;


async function createFaceLandmarker() {
    isLoading.value = true;
    const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
    faceLandMarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: "VIDEO",
        numFaces: 10,
    });
    isLoading.value = false;
}

const reloadFunc = () => {
    location.reload();
}



onMounted(async () => {
    if (area.value !== 0 && longitude.value !== 0 && latitude.value !== 0 && handle.value !== "") {
        await createFaceLandmarker();
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let canvas = document.getElementById("canvas") as HTMLCanvasElement;
        let photoCanvas = document.getElementById("photo") as HTMLCanvasElement;
        let photo = document.getElementById("photo") as HTMLCanvasElement;
        let video = document.getElementById("video") as HTMLVideoElement;
        canvas.width = windowWidth;
        canvas.height = windowHeight;
        let context = canvas.getContext("2d");
        if (context) {
            drawBorder(context, windowWidth, windowHeight, "white");
        }

        
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
                video.addEventListener("loadeddata", predict);
                let settings = stream.getVideoTracks()[0].getSettings();
                cameraWidth = settings.width || 0;
                cameraHeight = settings.height || 0;
            });

        async function check() {
            let photo = takePhoto(photoCanvas, video, cameraWidth, cameraHeight);

            if (photo) {
                let response = await $fetch<{ status: "success" | "error", code: string, data: string }>(apify("faceid"), {
                    method: "post",
                    body: JSON.stringify({
                        "data": encode(JSON.stringify({
                            "area": area.value,
                            "latitude": latitude.value,
                            "longitude": longitude.value,
                            "handle": handle.value,
                        })),
                        "image": photo,
                    })
                });

                if (response.status === "error") {
                    errorStore.setError(response.data);
                    errorStore.setCode(response.code);
                    navigateTo({ name: "error" });
                } else {
                    navigateTo({ name: "passed" });
                }

                console.log(response);
            }
        }
        
        async function predict() {
            const radio = video.videoHeight / video.videoWidth;

            let startTimeMS = performance.now();

            if (lastVideoTime !== video.currentTime) {
                lastVideoTime = video.currentTime;
                results = faceLandMarker.detectForVideo(video, startTimeMS);
            }

            let x1 = cameraWidth;
            let y1 = cameraHeight;
            let x2 = 0;
            let y2 = 0;
            
            if (results) {
                if (results.faceLandmarks.length === 1) {
                    results.faceLandmarks.forEach((element) => {
                        for (let a of element) {
                            let cordX = a.x * cameraWidth;
                            let cordY = a.y * cameraHeight;

                            if (cordX < x1) {
                                x1 = cordX;
                            }
                            if (cordY < y1) {
                                y1 = cordY;
                            }
                            if (cordX > x2) {
                                x2 = cordX;
                            }
                            if (cordY > y2) {
                                y2 = cordY;
                            }
                        }
                    });

                    if (x1 < cameraWidth / 6.0 || x1 > cameraWidth * 5 / 6 || y1 < cameraHeight / 6 || y1 > cameraHeight * 5 / 6 ||
                        x2 < cameraWidth / 6.0 || x2 > cameraWidth * 5 / 6 || y2 < cameraHeight / 6 || y2 > cameraHeight * 5 / 6) {
                            drawBorder(context, windowWidth, windowHeight, "red");
                    } else {
                        drawBorder(context, windowWidth, windowHeight, "green");
                        faceStatus.value = "upright";
                        centerText.value = "To'g'riga qarang";
                    }

                    let scale = Math.max(Math.ceil(x2) - Math.ceil(x1), Math.ceil(y2) - Math.ceil(y1) / (videoWidth / 4));

                    if (scale < 1.9 || scale > 2.1) {
                        drawBorder(context, windowWidth, windowHeight, "red");
                        faceStatus.value = "around";
                        centerText.value = "To'g'riga qarang";
                    }

                    results.facialTransformationMatrixes.forEach((element) => {
                        const matrix = [
                            element.data[0], element.data[1], element.data[2],
                            element.data[4], element.data[5], element.data[6],
                            element.data[8], element.data[9], element.data[10],
                        ];
                        const rodriguesVector = rodriguesRotationVectorFromMatrix(matrix);

                        let pitch = rodriguesVector[0];
                        let yaw = rodriguesVector[1];
                        let roll = rodriguesVector[2];

                        if (yaw < -7) {
                            drawBorder(context, windowWidth, windowHeight, "red");
                            faceStatus.value = "right";
                            centerText.value = "To'g'riga qarang";
                        } else if (yaw > 7) {
                            drawBorder(context, windowWidth, windowHeight, "red");
                            faceStatus.value = "left";
                            centerText.value = "To'g'riga qarang";
                        } else if (pitch < -7) {
                            drawBorder(context, windowWidth, windowHeight, "red");
                            faceStatus.value = "top";
                            centerText.value = "To'g'riga qarang";
                        } else if (pitch > 7) {
                            drawBorder(context, windowWidth, windowHeight, "red");
                            faceStatus.value = "bottom";
                            centerText.value = "To'g'riga qarang";
                        } else if (roll < -7) {
                            drawBorder(context, windowWidth, windowHeight, "red");
                            faceStatus.value = "around";
                            centerText.value = "To'g'riga qarang";
                        } else if (roll > 7) {
                            drawBorder(context, windowWidth, windowHeight, "red");
                            faceStatus.value = "around";
                            centerText.value = "To'g'riga qarang";
                        } else {
                            drawBorder(context, windowWidth, windowHeight, "green");
                            faceStatus.value = "upright";
                            centerText.value = "3 soniya to'g'riga qarab turing";
                            setTimeout(() => {
                                if (status !== true && faceStatus.value === 'upright') {
                                    centerText.value = "Tekshirilmoqda";
                                    status = true;
                                    process.value = "pause";
                                    isLoading.value = true;
                                    check();
                                }
                            }, 3000);
                        }
                    });
                } else if (results.faceLandmarks.length >= 2) {
                    drawBorder(context, windowWidth, windowHeight, "orange");
                    centerText.value = "1 tadan ko'p odam aniqlandi";
                } else {
                    drawBorder(context, windowWidth, windowHeight, "yellow");
                    centerText.value = "Odam aniqlanmadi. Kameraga qarang";
                }
            } else {
            }

            if (process.value === "play") {
                animationFrame = window.requestAnimationFrame(predict);
            } else {
                video.pause;
                if (video.srcObject) {
                    // @ts-ignore
                    video.srcObject.getTracks()[0].stop();
                }
                window.cancelAnimationFrame(animationFrame);
            }
        }
        
        
        watch(process, () => {
            if (process.value === "play") {
                animationFrame = window.requestAnimationFrame(predict);
            } else {
                video.pause;
                if (video.srcObject) {
                    // @ts-ignore
                    video.srcObject.getTracks()[0].stop();
                }
                window.cancelAnimationFrame(animationFrame);
            }
        });
    } else {
        navigateTo({ name: "index" });
    }

});

onUnmounted(() => {
});

</script>

<template>
    <div class="">
        <canvas class="hidden" id="photo"></canvas>
        <div class="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center z-[-1]">
            <p :class="'text-' + color + '-500'" class="text-3xl font-bold text-center">{{ centerText }}</p>
        </div>
        <Button v-if="reload" @click="reloadFunc" class="fixed bottom-10 left-[40%] z-50">Qayta urinish</Button>
        <canvas id="canvas" class="fixed top-0 left-0 w-full h-full z-[-1]"></canvas>
        <canvas id="photo" style="display: none;"></canvas>
        <video id="video" class="fixed top-0 left-0 w-full h-full z-[-10]" autoplay playsinline loop ></video>
    </div>
    <div :class="isLoading ? 'flex' : 'hidden'" class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-accent/70">
        <LucideRefreshCw class="animate-spin" :size="50" />
    </div>
</template>
