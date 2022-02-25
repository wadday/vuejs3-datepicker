<template>
  <Wrapper :templatecontent="template" :scriptcontent="script">
    <template v-slot:label>
      Range View
    </template>
    <template v-slot:content>
      <div class="flex-block">
        <appdate-picker
          range
          v-model:start-date="dateRange.start"
          v-model:end-date="dateRange.end"
          placeholder="Select Date Range"
          @input="handleChangedDay"
        ></appdate-picker>
        <div class="change-btn">
          <p>UpdateValue : {{ dateRange }}</p>
        </div>
      </div>
    </template>
  </Wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import Wrapper from '../wrapper/Wrapper.vue';
import Datepicker from '../datepicker/Datepicker.vue';

export default defineComponent({
  name: 'RangeView',
  components: {
    Wrapper,
    'appdate-picker': Datepicker,
  },
  setup() {
    const template = `<template>
    <appdate-picker
      initial-view="day"
      v-model:start-date="dateRange.start"
      v-model:end-date="dateRange.end"
      placeholder="Select Date Range"
      @input="handleChangedDay"
    >
    </appdate-picker>
  </template>`;

    const script = `<script lang="js">
  export default {
    setup(){
      const dateRange = reactive({
        start: null,
        end: null
      });
      function handleChangedDay(payload) {
        console.log( payload )
      }
      return {handleChangedDay, dateRange}
    }
  }
  <script>`;
    const dateRange = reactive({
      start: null,
      end: null,
    });
    /**
     * Handler for select-range function
     */
    function handleChangedDay(payload: any): void {
      console.log('selectedDay', payload);
    }
    return {
      template,
      script,
      handleChangedDay,
      dateRange,
    };
  },
});
</script>
