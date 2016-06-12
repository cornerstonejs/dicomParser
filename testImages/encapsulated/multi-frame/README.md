CT0012 from ftp://medical.nema.org/MEDICAL/Dicom/Multiframe/CT/nemamfct.images.tar.bz2
IM00001 from clear canvas data sets

Converted using DCMTK

```
## Not Fragmented with basic offset table
dcmcjpls CT0012.explicit_little_endian.dcm CT0012.not_fragmented_bot_jpeg_ls.80.dcm
dcmcrle CT0012.explicit_little_endian.dcm CT0012.not_fragmented_bot_rle.dcm

## Not Fragmented with empty basic offset table
dcmcjpls -ot CT0012.explicit_little_endian.dcm CT0012.not_fragmented_no_bot_jpeg_ls.80.dcm
dcmcrle -ot CT0012.explicit_little_endian.dcm CT0012.not_fragmented_no_bot_rle.dcm

## Fragments with empty basic offset table
dcmcjpeg -ot +fs 8 +eb IM00001.implicit_little_endian.dcm IM00001.fragmented_no_bot_jpeg_baseline.50.dcm
dcmcjpeg -ot +fs 8 +ee CT0012.explicit_little_endian.dcm CT0012.fragmented_no_bot_jpeg_baseline.51.dcm
dcmcjpeg -ot +fs 8 +el CT0012.explicit_little_endian.dcm CT0012.fragmented_no_bot_jpeg_lossless.57.dcm
dcmcjpeg -ot +fs 8 +e1 CT0012.explicit_little_endian.dcm CT0012.fragmented_no_bot_jpeg_lossless.70.dcm
dcmcjpls -ot +fs 8 CT0012.explicit_little_endian.dcm CT0012.fragmented_no_bot_jpeg_ls.80.dcm
dcmcjpls -ot +fs 8 +en CT0012.explicit_little_endian.dcm CT0012.fragmented_no_bot_jpeg_ls.81.dcm
```