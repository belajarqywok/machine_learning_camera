<template>
    <main class="camera-view app">
        <video ref="videoElement" autoplay playsinline></video>
        <div class="capture-button" @click="capturePhoto">Ambil Gambar</div>
    </main>
</template>

<script>

import Swal from 'sweetalert2'
import { generateBlobImageName } from './utils'

export default {
    data() {
        return {
            video: null,
            swal: Swal,
        }
    },

    mounted() {
        this.initCamera()
        this.setFullscreen()
    },

    methods: {
        async swalErrno(swal) {
            swal.close()
            swal.fire({
                title: 'Nginggg...!!!',
                text: 'Upps.. Gagal Mendeteksi, coba lagi !..',
                icon: 'error',
                confirmButtonText: 'Kembali'
            })
        },

        async initCamera() {
            try {
                const constraints = { video: { facingMode: 'environment' } }
                const stream = await navigator.mediaDevices.getUserMedia(constraints)
                this.$refs.videoElement.srcObject = stream

            } catch (_) { await this.swalErrno(this.swal) }
        },

        // Capture Photo
        async capturePhoto() {
            this.swal.fire({
                title: 'Sedang Menganalisa Penyakit..',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => { this.swal.showLoading() }
            })

            const video = this.$refs.videoElement
            const canvas = document.createElement('canvas')

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const context = canvas.getContext('2d')
            context.drawImage(video, 0, 0, canvas.width, canvas.height)

            const dataURI = canvas.toDataURL('image/jpeg')
            const blob = this.dataURItoBlob(dataURI)

            try {
                const formData = new FormData()
                formData.append('file', blob, await generateBlobImageName())
                    
                const headers = new Headers()
                headers.append('Accept', '*/*')
                headers.append('Accept-Encoding', 'gzip, deflate, br')
                headers.append('Connection', 'keep-alive')

                const endpoint = 'https://docpet-backend-service-rnjlx2stlq-et.a.run.app/api/disease_detection/'

                const response = await fetch(endpoint, {
                    body: formData,
                    method: 'POST',
                    headers: headers
                })

                if (!response.ok) await this.swalErrno(this.swal)

                const response_body = await response.json()

                if (response_body.data == null) await this.swalErrno(this.swal)
                else {
                    this.swal.close()
                    this.swal.fire({
                        title: `${response_body.data.name}!`,
                        html: `
                            <br/>
                            <b>Gejala</b>
                            <p style="text-align: justify;">${response_body.data.symptom}</p><br/>
                            <b>Perawatan</b>
                            <p style="text-align: justify;">${response_body.data.treatment}</p><br/>
                            <b>Informasi</b>
                            <p style="text-align: justify;">${response_body.data.information}</p>
                        `,
                        icon: 'success',
                        confirmButtonText: 'Kembali'
                    })
                }

            } catch (_) { await this.swalErrno(this.swal) }
        },

        // Convert URI data to Blob
        dataURItoBlob(dataURI) {
            const byteString = atob(dataURI.split(',')[1])
            const mimeString = dataURI.split(',')[0]
                .split(':')[1].split(';')[0]

            const ab = new ArrayBuffer(byteString.length)
            const ia = new Uint8Array(ab)

            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i)
            }

            return new Blob([ab], { type: mimeString })
        },

        // Set FullScreen
        setFullscreen() {
            const appElement = document.querySelector('.app')

            appElement.style.display = 'flex'
            appElement.style.justifyContent = 'center'
            appElement.style.alignItems = 'center'
            appElement.style.height = '100vh'
            appElement.style.backgroundColor = '#000'

            const videoElement = this.$refs.videoElement
            videoElement.style.width = '100vw'
            videoElement.style.height = '100vh'
            videoElement.style.objectFit = 'cover'
        }
    }
}
</script>