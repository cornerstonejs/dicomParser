```
## Not Fragmented with basic offset table
dcmcjpls CT1_UNC.explicit_little_endian.dcm CT1_UNC.not_fragmented_bot_jpeg_ls.80.dcm

## Not Fragmented with empty basic offset table
dcmcjpls -ot CT1_UNC.explicit_little_endian.dcm CT1_UNC.not_fragmented_no_bot_jpeg_ls.80.dcm

## Fragments with basic offset table
dcmcjpls +fs 8 CT1_UNC.explicit_little_endian.dcm CT1_UNC.fragmented_bot_jpeg_ls.80.dcm

## Fragments with empty basic offset table
dcmcjpls -ot CT1_UNC.explicit_little_endian.dcm CT1_UNC.fragmented_no_bot_jpeg_ls.80.dcm


```