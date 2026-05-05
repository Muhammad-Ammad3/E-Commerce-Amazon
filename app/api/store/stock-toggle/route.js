// toogle stock of a product

export async function POST(request) {
  try {
    const { userId } = getAut(request);
    const storeId = await authSeller(userId);
  } catch (error) {
    console.error("Error toggling stock:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
