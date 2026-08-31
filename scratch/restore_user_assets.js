const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG',
  apiVersion: '2024-07-09',
  useCdn: false,
});

async function inspectAndRestore() {
  try {
    const doc = await client.fetch(`*[_type == "educationToursSettings"][0]`);
    if (!doc) {
      console.error("No educationToursSettings doc found!");
      return;
    }

    // Map the 7 uploaded images to the 7 institutions
    // 1. Science Centre
    // 2. Discovery Centre
    // 3. Marina Barrage
    // 4. SUTD
    // 5. SMU
    // 6. NTU
    // 7. NUS
    const uploadedAssetIds = [
      { id: 'science-centre', assetId: 'image-0045c24d125195f5ebd9b5c3972427cf687eeed2-738x357-jpg' },
      { id: 'discovery-centre', assetId: 'image-6a017715943b2a36c69ece469868b755fc0818f8-678x452-jpg' },
      { id: 'marina-barrage', assetId: 'image-e7b8f003b9c98e13213e206d76d76066e1262cbc-515x388-jpg' },
      { id: 'sutd', assetId: 'image-6d0972ea9e7614805a1a49501fb190c33376cd18-738x270-jpg' },
      { id: 'smu', assetId: 'image-04d19cc2fdd9d2650d9f5acf13390ee38a05df59-594x336-jpg' },
      { id: 'ntu', assetId: 'image-7997ad68572cd0ba8ed3badb5c0256f8728069c3-547x365-jpg' },
      { id: 'nus', assetId: 'image-01f93d0537f3fb27bd57bc9db6a088a11ad13a46-632x316-jpg' },
    ];

    const specificVideos = [
      { id: 'science-centre', videoUrl: 'https://www.youtube.com/watch?v=kYJ5q5hK41A' },
      { id: 'discovery-centre', videoUrl: 'https://www.youtube.com/watch?v=tY2uK6vFz9s' },
      { id: 'marina-barrage', videoUrl: 'https://www.youtube.com/watch?v=P-jV0g6FqjM' },
      { id: 'sutd', videoUrl: 'https://www.youtube.com/watch?v=s3eZ19d4T_8' },
      { id: 'smu', videoUrl: 'https://www.youtube.com/watch?v=xQW53a-aUvU' },
      { id: 'ntu', videoUrl: 'https://www.youtube.com/watch?v=bB3K9d4jYgU' },
      { id: 'nus', videoUrl: 'https://www.youtube.com/watch?v=bXv8jN3hU6M' },
    ];

    const updatedInstitutions = doc.institutions.map((inst, idx) => {
      const matchAsset = uploadedAssetIds.find(a => a.id === inst.id) || uploadedAssetIds[idx];
      const matchVideo = specificVideos.find(v => v.id === inst.id) || specificVideos[idx];

      return {
        ...inst,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: matchAsset.assetId
          }
        },
        videoUrl: inst.videoUrl && !inst.videoUrl.includes('kYJ5q5hK41A') ? inst.videoUrl : matchVideo.videoUrl
      };
    });

    console.log("Patching educationToursSettings with restored user image assets and specific video URLs...");
    await client
      .patch(doc._id)
      .set({ institutions: updatedInstitutions })
      .commit();

    console.log("✅ Successfully restored all 7 uploaded user images and distinct video URLs in Sanity!");

  } catch (err) {
    console.error("Failed to restore assets:", err);
  }
}

inspectAndRestore();
