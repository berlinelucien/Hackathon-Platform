<template>
  <div class="about">
    <h2 class="page-header">Project Gallery</h2>
    <div class="input-wrapper">
      <input type="text" class="" id="titleInput" placeholder="Search" />
      <Button>Search</Button>
    </div>
    <div class="project-container">
      <a
        :href="'http://localhost:8080/galleryDetails?id=' + project.projectID"
        v-for="project in projectsList"
        :key="project.name"
      >
        <div
          style="height: 340px; width: 333px; margin:50px ; border: 0; background-color: var(--color-foreground); border-radius: var(--border-radius); "
        >
          <div class="project-card-image">
            <img
              :src="project.coverImage"
              style="height: 100%; width: 100%; border-top-left-radius: var(--border-radius); border-top-right-radius: var(--border-radius);"
            />
          </div>
          <h5 style="padding-top: 10px;">{{ project.name }}</h5>
          {{ project.description }}
        </div></a
      >
    </div>
  </div>
</template>

<script>
import generalMixin from '../mixins/general';

export default {
  name: 'Gallery',
  mixins: [generalMixin],
  data() {
    return {
      projectsList: [
        {
          name: 'test',
          description: 'This is a test description for demo purposes.',
          coverImage:
            'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_thumbnail_photos/001/264/299/datas/medium.png',
          projectID: 'abc123',
        },
        {
          name: 'test1',
          description: 'This is a test description for demo purposes.',
          coverImage:
            'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/001/264/917/datas/medium.png',
          projectID: 'abc234',
        },
        {
          name: 'test2',
          description: 'This is a test description for demo purposes.',
          coverImage:
            'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_thumbnail_photos/001/264/299/datas/medium.png',
          projectID: 'abc345',
        },
        {
          name: 'test',
          description: 'This is a test description for demo purposes.',
          coverImage:
            'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/001/264/917/datas/medium.png',
          projectID: 'abc456',
        },
        {
          name: 'test1',
          description: 'This is a test description for demo purposes.',
          coverImage:
            'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_thumbnail_photos/001/264/299/datas/medium.png',
          projectID: 'abc567',
        },
        {
          name: 'test2',
          description: 'This is a test description for demo purposes.',
          coverImage:
            'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/001/264/917/datas/medium.png',
          projectID: 'abc678',
        },
      ],
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.project-container {
  display: flex;
  flex-flow: row wrap;
}

.project-card-image {
  height: 222px;
  width: 333px;
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}
</style>
