<Section title="SEO Settings">
  <Input
    label="Default SEO Title"
    value={settings.seo_title}
    onChange={(v) => setField("seo_title", v)}
  />

  <Textarea
    label="Default Meta Description"
    value={settings.meta_description}
    onChange={(v) =>
      setField("meta_description", v)
    }
  />

  <AdminImageUpload
    label="Open Graph Image"
    value={settings.og_image}
    onChange={(v) =>
      setField("og_image", v)
    }
  />
</Section>
