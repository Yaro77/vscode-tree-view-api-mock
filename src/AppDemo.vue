<template>
  <AppContainer>
    <template #default="{ addEvent }">
      <LocationTreeView :reference-description="rd" @selection-changed="addEvent" />
    </template>
  </AppContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppContainer from './AppContainer.vue';
import LocationTreeView from '@/components/locationTreeView/LocationTreeView.vue';

import { RefDescription } from '@/common/types';

const src =
  '{"countries":[{"iso":"FI","id":173812923,"name":"Finland"},{"iso":"TR","id":73,"name":"Turkey"},{"iso":"LV","id":1102,"name":"Latvia"}],"regions":[{"countryId":173812923,"id":214144275,"name":"Southern Finland"},{"countryId":73,"id":174,"name":"Istanbul"},{"countryId":73,"id":442238243,"name":"Kayseri"},{"countryId":73,"id":417029073,"name":"Central Anatolia"},{"countryId":1102,"id":9612731,"name":"Riga Region"}],"locations":[{"regionId":214144275,"code":"HEL","id":214144360,"name":"Helsinki"},{"regionId":174,"code":"IST","id":288,"name":"Istanbul"},{"regionId":442238243,"code":"ASR","id":417029245,"name":"Kayseri"},{"regionId":417029073,"code":"NAV","id":419096509,"name":"Nevsehir"},{"regionId":9612731,"code":"RIX","id":9612847,"name":"Riga"}],"locationAreas":[{"locationId":288,"id":512408030,"name":"Yenikapi"},{"locationId":288,"id":437106956,"name":"Laleli"},{"locationId":288,"id":437107124,"name":"Sultanahmet"},{"locationId":288,"id":603504938,"name":"New City"},{"locationId":288,"id":464947802,"name":"Pera"},{"locationId":288,"id":465755799,"name":"Karakoy"},{"locationId":419096509,"id":439266283,"name":"Urgup"},{"locationId":419096509,"id":444214274,"name":"Ortahisar"},{"locationId":288,"id":600905561,"name":"Old City"},{"locationId":288,"id":437107040,"name":"Taksim"},{"locationId":288,"id":447503744,"name":"Fatih"},{"locationId":288,"id":464947924,"name":"Halic"},{"locationId":419096509,"id":444214443,"name":"Uchisar"},{"locationId":419096509,"id":444214234,"name":"Goreme"},{"locationId":419096509,"id":440296951,"name":"Avanos"},{"locationId":288,"id":463690899,"name":"Beyoglu"},{"locationId":288,"id":444948361,"name":"Bakirkoy"},{"locationId":288,"id":437107069,"name":"Sisli"},{"locationId":288,"id":446405033,"name":"Besiktas"},{"locationId":288,"id":437107109,"name":"Bosphorus"}]}';

const rd = ref<RefDescription>(JSON.parse(src));
</script>

<style lang="scss" scoped></style>
