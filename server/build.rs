use std::error::Error;
use std::path::PathBuf;

fn main() -> Result<(), Box<dyn Error>> {
    let out_dir = PathBuf::from("proto/reflection");
    let type_dir= PathBuf::from("src/types");
    println!("cargo:rustc-link-search={}", out_dir.display());
    tonic_build::configure()
        .out_dir(&type_dir)
        .file_descriptor_set_path(out_dir.join("server_descriptor.bin"))
        .compile_protos(&["proto/ping.proto", "proto/events.proto", "proto/auth.proto", "proto/onboarding.proto", "proto/admin.proto"], &["proto/"])?;
    tonic_build::compile_protos("proto/events.proto")?;
    tonic_build::compile_protos("proto/ping.proto")?;
    tonic_build::compile_protos("proto/auth.proto")?;
    tonic_build::compile_protos("proto/onboarding.proto")?;
    tonic_build::compile_protos("proto/admin.proto")?;
    Ok(())

}