<script setup lang="ts">
import { ref, toRaw, onMounted } from 'vue'
import { NButton, useNotification } from 'naive-ui'
import { json } from '@codemirror/legacy-modes/mode/javascript'
import { lua } from '@codemirror/legacy-modes/mode/lua'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { WasmCode } from '@libreservice/wasm-code'
import { worker, deploy, FS } from '../workerAPI'
import {
  changeIME,
  deployed,
  selectOptions
} from '../control'
import type MyMenu from './MyMenu.vue'

const langParserMap = {
  json, lua, yaml
}

const extLangMap = {
  json: 'json',
  lua: 'lua',
  yaml: 'yaml'
}

const props = defineProps<{
  menu?: InstanceType<typeof MyMenu>
}>()

const { menu } = toRaw(props)
const notification = useNotification()

worker.control('deployStatus', async (status: 'start' | 'failure' | 'success', schemas: string) => {
  const options = {
    duration: 5000,
    keepAliveOnHover: true
  }
  switch (status) {
    case 'start':
      notification.info({
        content: 'Deployment started',
        ...options
      })
      menu?.setLoading(true)
      break
    case 'failure':
      notification.error({
        content: 'Deployment failed',
        ...options
      })
      menu?.setLoading(false)
      break
    case 'success':
      notification.success({
        content: 'Deployment succeeded',
        ...options
      })
      deployed.value = true
      selectOptions.value = []
      {
        const schemasJson = JSON.parse(schemas) as {
          id: string,
          name: string
        }[]
        for (const schema of schemasJson) {
          selectOptions.value.push({
            label: schema.name,
            value: schema.id
          })
        }
        const currentSchema = schemasJson[0].id
        await changeIME(currentSchema)
        menu?.displayIME(currentSchema)
      }
      menu?.setLoading(false)
      break
  }
})

const wc = ref<InstanceType<typeof WasmCode>>()

onMounted(() => {
  [
    '/',
    '/rime/',
    '/usr/',
    '/usr/local/',
    '/usr/local/share/',
    '/usr/local/share/opencc/'
  ].forEach(wc.value!.expandFolder)
})
</script>

<template>
  <div>
    <n-button
      secondary
      type="info"
      @click="deploy()"
    >
      Deploy
    </n-button>
    <wasm-code
      ref="wc"
      :fs="FS"
      height="80vh"
      :lang-parser-map="langParserMap"
      :ext-lang-map="extLangMap"
    />
  </div>
</template>
