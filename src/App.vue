<template>
	<main class="camera-view app">
		<video ref="videoElement" autoplay playsinline></video>
	  	<div class="capture-button" @click="capturePhoto">Jeprett..</div>
	</main>
</template>
  
<script>
  	import Swal from 'sweetalert2'
  
	export default {
		data() {
			return {
				video: null,
			}
		},
	
		mounted() {
			this.initCamera()
			this.setFullscreen()
		},
	
		methods: {
			swalErrno: async (Swal) => {
				Swal.close()
				Swal.fire({
					title: 'Nginggg...!!!',
					text: 'Upps.. Gagal Mendeteksi, coba lagi !..',
					icon: 'error',
					confirmButtonText: 'Kembali',
				});
			},

			async initCamera() {
				try {
					const constraints = { video: { facingMode: 'environment' } }
					const stream = await navigator.mediaDevices.getUserMedia(constraints)
					this.$refs.videoElement.srcObject = stream

				} catch (_) { await this.swalErrno() }
			},
	
			async capturePhoto() {
				Swal.fire({
					title: 'Sedang Menganalisa Penyakit..',
					allowOutsideClick: false,
					showConfirmButton: false,
					willOpen: () => {
						Swal.showLoading()
					},
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
					formData.append('file', blob)

					const endpoint = 'http://192.168.137.1:8000/api/disease_detection/'
		
					const response = await fetch(endpoint, {
						method: 'POST',
						body: formData,
					})
		
					const response_body = await response.json()
					Swal.close()
					Swal.fire({
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
						confirmButtonText: 'Kembali',
					})

				} catch (_) { await this.swalErrno() }
			},
	
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
			},
		}
	}
</script>