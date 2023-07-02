<template>
  <AppContainer>
    <template #default="{ addEvent }">
      <div class="tv-container">
        <div><button @click="clearSelection">Clear</button></div>
        <SearchLocationTreeView v-model:selected-locations="selectedLocations" @update:selected-locations="addEvent"
          :response="succeededResponse" />
      </div>
    </template>
  </AppContainer>
</template>

<script setup lang="ts">
import AppContainer from './AppContainer.vue';
import SearchLocationTreeView from '@/components/searchLocationTreeView/SearchLocationTreeView.vue';
import { ISearchNode, Response } from "@/components/searchLocationTreeView/types"
import { ref } from 'vue';

const succeededResponse: Response = JSON.parse('{"regionIds":[14798,15133],"locations":[{"locationId":15732,"hasHotelsOutsideAreas":true},{"locationId":15785,"hasHotelsOutsideAreas":true},{"locationId":15794,"hasHotelsOutsideAreas":true},{"locationId":15791,"hasHotelsOutsideAreas":true},{"locationId":15821,"hasHotelsOutsideAreas":true},{"locationId":15878,"hasHotelsOutsideAreas":true}],"locationAreaIds":[15954,15926,15999,15966,15960,15989,16011,16137,16114,16141,16162,16194,16202],"referenceDescription":{"regions":[{"countryId":14444,"timeZone":null,"id":14798,"name":"Antalya","optionalLanguageNames":[{"languageCode":"FI","value":"Antalya"},{"languageCode":"EN","value":"Antalya"}]},{"countryId":14444,"timeZone":null,"id":15133,"name":"Istanbul","optionalLanguageNames":[{"languageCode":"FI","value":"Istanbul"},{"languageCode":"EN","value":"Istanbul"}]}],"locations":[{"regionId":14798,"code":"AYT","id":15732,"name":"Antalya","optionalLanguageNames":[{"languageCode":"FI","value":"Antalya"},{"languageCode":"EN","value":"Antalya"}]},{"regionId":14798,"code":"","id":15785,"name":"Kemer","optionalLanguageNames":[{"languageCode":"FI","value":"Kemer"},{"languageCode":"EN","value":"Kemer"}]},{"regionId":14798,"code":"","id":15794,"name":"Belek","optionalLanguageNames":[{"languageCode":"FI","value":"Belek"},{"languageCode":"EN","value":"Belek"}]},{"regionId":14798,"code":"","id":15791,"name":"Alanya","optionalLanguageNames":[{"languageCode":"FI","value":"Alanya"},{"languageCode":"EN","value":"Alanya"}]},{"regionId":14798,"code":"","id":15821,"name":"Side","optionalLanguageNames":[{"languageCode":"FI","value":"Side"},{"languageCode":"EN","value":"Side"}]},{"regionId":15133,"code":"IST","id":15878,"name":"Istanbul","optionalLanguageNames":[{"languageCode":"FI","value":"Istanbul"},{"languageCode":"EN","value":"Istanbul"}]}],"locationAreas":[{"locationId":15732,"id":15954,"name":"Kundu","optionalLanguageNames":[{"languageCode":"FI","value":"Kundu"},{"languageCode":"EN","value":"Kundu"}]},{"locationId":15732,"id":15926,"name":"Lara","optionalLanguageNames":[{"languageCode":"FI","value":"Lara"},{"languageCode":"EN","value":"Lara"}]},{"locationId":15785,"id":15999,"name":"Beldibi","optionalLanguageNames":[{"languageCode":"FI","value":"Beldibi"},{"languageCode":"EN","value":"Beldibi"}]},{"locationId":15785,"id":15966,"name":"Goynuk","optionalLanguageNames":[{"languageCode":"FI","value":"Goyuk"},{"languageCode":"EN","value":"Goynuk"}]},{"locationId":15785,"id":15960,"name":"Kemer Center","optionalLanguageNames":[{"languageCode":"FI","value":"Kemerin keskus"},{"languageCode":"EN","value":"Kemer Center"}]},{"locationId":15785,"id":15989,"name":"Kiris","optionalLanguageNames":[{"languageCode":"FI","value":"Kiiris"},{"languageCode":"EN","value":"Kiris"}]},{"locationId":15794,"id":16011,"name":"Belek Center","optionalLanguageNames":[{"languageCode":"FI","value":"Belekin keskus"},{"languageCode":"EN","value":"Belek Center"}]},{"locationId":15821,"id":16137,"name":"Kizilot","optionalLanguageNames":[{"languageCode":"FI","value":"Kizilotin"},{"languageCode":"EN","value":"Kizilot"}]},{"locationId":15821,"id":16114,"name":"Kumkoy","optionalLanguageNames":[{"languageCode":"FI","value":"Kumköy"},{"languageCode":"EN","value":"Kumkoy"}]},{"locationId":15878,"id":16141,"name":"Topkapi","optionalLanguageNames":[{"languageCode":"FI","value":"Topkapissa"},{"languageCode":"EN","value":"Topkapi"}]},{"locationId":15878,"id":16162,"name":"Halic","optionalLanguageNames":[{"languageCode":"FI","value":"Halicia"},{"languageCode":"EN","value":"Halic"}]},{"locationId":15878,"id":16194,"name":"Karakoy","optionalLanguageNames":[{"languageCode":"FI","value":"Karakoi"},{"languageCode":"EN","value":"Karakoy"}]},{"locationId":15878,"id":16202,"name":"Taksim","optionalLanguageNames":[{"languageCode":"FI","value":"Taksimi"},{"languageCode":"EN","value":"Taksim"}]}]}}')
console.log(succeededResponse)

const selectedLocations = ref<ISearchNode[]>()

function clearSelection() {
  selectedLocations.value = []
}

</script>

<style lang="scss" scoped>
.tv-container {
  display: flex;
  flex-flow: column nowrap;
  gap: 4px;

  > :nth-child(1) {
    flex: 0 0 auto;
    align-self: end;
  }

  > :nth-child(2) {
    flex: 1 1 0;
  }
}
</style>
